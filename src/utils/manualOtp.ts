import readline from 'node:readline';

export async function getManualOtp(): Promise<string> {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const otp = await new Promise<string>((resolve) => {
      readlineInterface.question(
        'Enter the OTP: ',
        (answer) => {
          resolve(answer.trim());
        }
      );
    });

    if (!/^\d{6}$/.test(otp)) {
      throw new Error(
        `OTP must contain exactly 6 digits. Received: "${otp}"`
      );
    }

    return otp;
  } finally {
    readlineInterface.close();
  }
}