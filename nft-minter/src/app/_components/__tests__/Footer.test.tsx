/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '../Footer';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Footer Component', () => {
  it('should render footer element', () => {
    render(<Footer />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should render brand name', () => {
    render(<Footer />);
    
    expect(screen.getByText('NFT铸造')).toBeInTheDocument();
  });

  it('should render brand description', () => {
    render(<Footer />);
    
    expect(screen.getByText(/简单几步，将您的创意铸造为 NFT/)).toBeInTheDocument();
  });

  it('should render platform section links', () => {
    render(<Footer />);
    
    expect(screen.getByText('平台')).toBeInTheDocument();
    expect(screen.getByText('关于我们')).toBeInTheDocument();
    expect(screen.getByText('帮助中心')).toBeInTheDocument();
    
    // Use getAllByText for duplicate links
    const privacyLinks = screen.getAllByText('隐私政策');
    expect(privacyLinks.length).toBeGreaterThan(0);
    
    const termsLinks = screen.getAllByText('服务条款');
    expect(termsLinks.length).toBeGreaterThan(0);
  });

  it('should render resources section links', () => {
    render(<Footer />);
    
    expect(screen.getByText('资源')).toBeInTheDocument();
    expect(screen.getByText('开发文档')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('教程')).toBeInTheDocument();
    expect(screen.getByText('博客')).toBeInTheDocument();
  });

  it('should render community section links', () => {
    render(<Footer />);
    
    expect(screen.getByText('社区')).toBeInTheDocument();
    expect(screen.getByText('Discord')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Telegram')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('should render social media icons with correct aria-labels', () => {
    render(<Footer />);
    
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Discord')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
  });

  it('should render copyright text with current year', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} NFT铸造平台`))).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    render(<Footer />);
    
    const brandLink = screen.getByText('NFT铸造').closest('a');
    expect(brandLink).toHaveAttribute('href', '/');
    
    const aboutLink = screen.getByText('关于我们').closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');
    
    const docsLink = screen.getByText('开发文档').closest('a');
    expect(docsLink).toHaveAttribute('href', '/docs');
  });

  it('should have external social media links', () => {
    render(<Footer />);
    
    const twitterIcon = screen.getByLabelText('Twitter');
    expect(twitterIcon).toHaveAttribute('href', 'https://twitter.com');
    
    const discordIcon = screen.getByLabelText('Discord');
    expect(discordIcon).toHaveAttribute('href', 'https://discord.gg');
    
    const githubIcon = screen.getByLabelText('GitHub');
    expect(githubIcon).toHaveAttribute('href', 'https://github.com');
  });

  it('should render all footer sections', () => {
    render(<Footer />);
    
    // Check that all three main sections are rendered
    expect(screen.getByText('平台')).toBeInTheDocument();
    expect(screen.getByText('资源')).toBeInTheDocument();
    expect(screen.getByText('社区')).toBeInTheDocument();
  });
});