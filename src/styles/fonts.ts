import { Poppins } from 'next/font/google';
import { Noto_Sans_JP, Noto_Sans_SC, Noto_Sans_TC, Noto_Sans_KR, Noto_Sans } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

export const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

export const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
});