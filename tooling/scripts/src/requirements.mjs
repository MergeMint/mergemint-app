import { execSync } from 'child_process';

// check requirements to run Makerkit
void checkRequirements();

function checkRequirements() {
  checkNodeVersion();
  checkPathNotOneDrive();
  checkPnpmVersion();
}

/**
 * Checks if the current pnpm version is compatible with Makerkit.
 * If the current pnpm version is not compatible, it exits the script with an error message.
 */
function checkPnpmVersion() {
  const requiredPnpmVersion = '>=9.12.0';
  const currentPnpmVersion = execSync('pnpm --version').toString().trim();
  const [major, minor] = currentPnpmVersion.split('.').map(Number);

  if (!currentPnpmVersion) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      `You are running Makerkit from a directory that does not have pnpm installed. Please install pnpm and run "pnpm install" in your project directory.`,
    );

    process.exit(1);
  }

  if (major < 9) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      `You are running pnpm ${currentPnpmVersion}. Makerkit requires pnpm ${requiredPnpmVersion}.`,
    );

    process.exit(1);
  }

  // warn if the minor version is less than 12
  if (minor < 12) {
    console.warn(
      `\x1b[33m%s\x1b[0m`,
      `You are running pnpm ${currentPnpmVersion}. Makerkit recommends using pnpm 9.12.0 or higher.`,
    );
  } else {
    console.log(
      `\x1b[32m%s\x1b[0m`,
      `You are running pnpm ${currentPnpmVersion}.`,
    );
  }
}

/**
 * Checks if the current Node version is compatible with Makerkit.
 * If the current Node version is not compatible, it exits the script with an error message.
 */
function checkNodeVersion() {
  const requiredNodeVersion = '>=v18.18.0';
  const currentNodeVersion = process.versions.node;
  const [major, minor] = currentNodeVersion.split('.').map(Number);

  if (major < 18 || (major === 18 && minor < 18)) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      `You are running Node ${currentNodeVersion}. Makerkit requires Node ${requiredNodeVersion}.`,
    );

    process.exit(1);
  } else {
    console.log(
      `\x1b[32m%s\x1b[0m`,
      `You are running Node ${currentNodeVersion}.`,
    );
  }
}

/**
 * Checks if the current working directory is not OneDrive.
 * If the current working directory is OneDrive, it exits the script with an error message.
 */
function checkPathNotOneDrive() {
  const path = process.cwd();

  if (path.includes('OneDrive')) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      `You are running Makerkit from OneDrive. Please move your project to a local folder.`,
    );

    process.exit(1);
  }
}
