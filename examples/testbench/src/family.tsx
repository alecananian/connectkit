const Logo = ({ staging }: { staging?: boolean }) => (
  <svg
    width="88"
    height="88"
    viewBox="0 0 88 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      background: staging
        ? 'linear-gradient(180deg, #8995A9 0%, #424D5F 99.48%)'
        : '#C2C9D6',
    }}
  >
    <path
      d="M70 44.007C70 39.7635 66.9617 36.2203 62.9434 35.45V35.282C66.9617 34.5117 70 30.9685 70 26.725C70 21.9074 66.0937 18.014 61.2913 18.014C57.077 18.014 53.5768 20.997 52.7506 24.9604H52.5407C51.7145 20.983 48.2003 18 44 18C39.7997 18 36.2855 20.983 35.4593 24.9464H35.2494C34.4372 20.983 30.923 18 26.7087 18C21.9063 18 18 21.9074 18 26.711C18 30.9545 21.0382 34.4977 25.0565 35.268V35.4361C21.0382 36.2203 18 39.7495 18 44.007C18 48.2645 21.0382 51.7936 25.0565 52.5639V52.732C21.0382 53.5023 18 57.0454 18 61.289C18 66.1066 21.9063 70 26.7087 70C30.923 70 34.4372 67.017 35.2494 63.0396H35.4593C36.2713 67.003 39.7857 70 44 70C48.2143 70 51.7287 67.017 52.5407 63.0396H52.7506C53.5628 67.003 57.077 70 61.2913 70C66.1076 70 70 66.0926 70 61.289C70 57.0454 66.9617 53.5023 62.9434 52.732V52.5639C66.9617 51.7936 70 48.2505 70 44.007ZM57.987 55.9531C57.987 57.0875 57.077 57.9978 55.9429 57.9978H32.0571C30.923 57.9978 30.0129 57.0875 30.0129 55.9531V32.0609C30.0129 30.9265 30.923 30.0162 32.0571 30.0162H55.9429C57.077 30.0162 57.987 30.9265 57.987 32.0609V55.9531Z"
      fill="white"
    />
  </svg>
);

export const family = {
  id: 'family',
  name: 'Family',
  logos: {
    default: <Logo />,
  },
  logoBackground: '#C2C9D6',
  scannable: true,
  installed: false,
  downloadUrls: {
    download: 'https://connect.family.co/v0/download/family',
    website: 'https://family.co',
  },
  createUri: (uri: string) => {
    return `family://wc?uri=${encodeURIComponent(uri)}`;
  },
};

export const familyStaging = {
  id: 'familyStaging',
  name: 'Family Staging',
  shortName: 'Family',
  logos: {
    default: <Logo staging />,
  },
  logoBackground: '#C2C9D6',
  scannable: true,
  installed: false,
  downloadUrls: {
    download: 'https://connect.family.co/v0/download/family',
    website: 'https://family.co',
  },
  createUri: (uri: string) => {
    return `familyStaging://wc?uri=${encodeURIComponent(uri)}`;
  },
};