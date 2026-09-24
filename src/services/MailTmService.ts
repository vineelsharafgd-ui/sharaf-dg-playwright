export interface MailTmAccount {
  email: string;
  password: string;
  token: string;
}

interface MailTmDomain {
  domain: string;
}

interface MailTmAccountResponse {
  id: string;
  address: string;
  password: string;
}

interface MailTmTokenResponse {
  token: string;
}

interface MailTmMessage {
  id: string;
  subject?: string;
  intro?: string;
  text?: string;
  html?: string[];
}

interface MailTmMessagesResponse {
  hydra_member?: MailTmMessage[];
  'hydra:member'?: MailTmMessage[];
  member?: MailTmMessage[];
}

export class MailTmService {
  private readonly baseUrl = 'https://api.mail.tm';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `Mail.tm API failed: ${response.status} ${response.statusText} - ${body}`
      );
    }

    return response.json() as Promise<T>;
  }

  private async getPassword(): Promise<string> {
    return 'Playwright@12345';
  }

  async createAccount(): Promise<MailTmAccount> {
    const domainsResponse = await this.request<{
      'hydra:member'?: MailTmDomain[];
      member?: MailTmDomain[];
    }>('/domains');

    const domains =
      domainsResponse['hydra:member'] ||
      domainsResponse.member ||
      [];

    if (domains.length === 0) {
      throw new Error('No Mail.tm domains available.');
    }

    const domain = domains[0].domain;
    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    const email = `pwtest${randomNumber}@${domain}`;
    const password = await this.getPassword();

    const account = await this.request<MailTmAccountResponse>(
      '/accounts',
      {
        method: 'POST',
        body: JSON.stringify({
          address: email,
          password,
        }),
      }
    );

    const tokenResponse = await this.login(
      account.address,
      password
    );

    return {
      email: account.address,
      password,
      token: tokenResponse,
    };
  }

  async login(
    email: string,
    password: string
  ): Promise<string> {
    const response = await this.request<MailTmTokenResponse>(
      '/token',
      {
        method: 'POST',
        body: JSON.stringify({
          address: email,
          password,
        }),
      }
    );

    return response.token;
  }

  async getMessageIds(
    account: MailTmAccount
  ): Promise<Set<string>> {
    const response = await this.request<MailTmMessagesResponse>(
      '/messages',
      {
        headers: {
          Authorization: `Bearer ${account.token}`,
        },
      }
    );

    const messages =
      response['hydra:member'] ||
      response.hydra_member ||
      response.member ||
      [];

    return new Set(messages.map((message) => message.id));
  }

  private async getMessages(
    account: MailTmAccount
  ): Promise<MailTmMessage[]> {
    const response = await this.request<MailTmMessagesResponse>(
      '/messages',
      {
        headers: {
          Authorization: `Bearer ${account.token}`,
        },
      }
    );

    return (
      response['hydra:member'] ||
      response.hydra_member ||
      response.member ||
      []
    );
  }

  private async getMessage(
    account: MailTmAccount,
    messageId: string
  ): Promise<MailTmMessage> {
    return this.request<MailTmMessage>(
      `/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${account.token}`,
        },
      }
    );
  }

  private extractOtp(message: MailTmMessage): string | null {
    const content = [
      message.subject || '',
      message.intro || '',
      message.text || '',
      ...(message.html || []),
    ].join(' ');

    const matches = content.match(/\b\d{6}\b/g);

    if (!matches || matches.length === 0) {
      return null;
    }

    return matches[matches.length - 1];
  }

  async waitForOtp(
    account: MailTmAccount,
    timeoutMs = 60000,
    pollIntervalMs = 2000
  ): Promise<string> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const messages = await this.getMessages(account);

      for (const message of messages) {
        const fullMessage = await this.getMessage(
          account,
          message.id
        );

        const otp = this.extractOtp(fullMessage);

        if (otp) {
          return otp;
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, pollIntervalMs)
      );
    }

    throw new Error(
      `Timed out waiting for Mail.tm OTP after ${timeoutMs}ms.`
    );
  }

  async waitForNewOtp(
    account: MailTmAccount,
    existingMessageIds: Set<string>,
    timeoutMs = 60000,
    pollIntervalMs = 2000
  ): Promise<string> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const messages = await this.getMessages(account);

      for (const message of messages) {
        if (existingMessageIds.has(message.id)) {
          continue;
        }

        const fullMessage = await this.getMessage(
          account,
          message.id
        );

        const otp = this.extractOtp(fullMessage);

        if (otp) {
          return otp;
        }
      }

      await new Promise((resolve) =>
        setTimeout(resolve, pollIntervalMs)
      );
    }

    throw new Error(
      `Timed out waiting for new Mail.tm OTP after ${timeoutMs}ms.`
    );
  }
}