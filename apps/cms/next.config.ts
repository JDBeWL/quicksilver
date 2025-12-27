import type { NextConfig } from "next";

const blogMode = process.env.BLOG_MODE;
const validModes = ['personal', 'multi_user'];

if (!blogMode || !validModes.includes(blogMode)) {
  console.error(
    `\x1b[31mError: Invalid or missing BLOG_MODE environment variable.\x1b[0m\n` +
    `Please set BLOG_MODE to either 'personal' or 'multi_user' in your .env file.\n` +
    `Current value: ${blogMode}`
  );
  process.exit(1);
}

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; font-src 'self' data:;",
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@quicksilver/database", "@quicksilver/content-core"],
  // reactCompiler: true, // Commented out as it might cause issues if not fully supported/configured yet
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
