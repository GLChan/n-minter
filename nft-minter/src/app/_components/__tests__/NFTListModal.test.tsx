/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NFTListModal } from '../NFTListModal';
import { NFTInfo } from '@/app/_lib/types';

// Mock the Modal component
jest.mock('../ui/Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, title, children }: any) => (
    isOpen ? (
      <div data-testid="mock-modal">
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose}>Close</button>
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null
  ),
}));

// Mock the ListNFTForm component
jest.mock('../ui/ListNFTForm', () => ({
  ListNFTForm: ({ nft, onSuccess, onCancel }: any) => (
    <div data-testid="mock-list-nft-form">
      <div data-testid="form-nft-id">{nft?.id}</div>
      <div data-testid="form-nft-name">{nft?.name}</div>
      <button data-testid="form-success" onClick={onSuccess}>Success</button>
      <button data-testid="form-cancel" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('NFTListModal Component', () => {
  const mockNFT: NFTInfo = {
    id: 'nft-123',
    name: 'Test NFT',
    description: 'A test NFT for listing',
    image_url: 'https://example.com/nft.jpg',
    token_id: '1',
    contract_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    owner_id: 'owner-456',
    creator_id: 'creator-789',
    collection_id: 'collection-101',
    is_listed: false,
    list_price: null,
    list_currency: null,
    last_sale_price: null,
    last_sale_currency: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    collection: {
      id: 'collection-101',
      name: 'Test Collection',
      description: 'A test collection',
      logo_image_url: 'https://example.com/collection.jpg',
      contract_address: '0xfedcbafedcbafedcbafedcbafedcbafedcbafed',
      creator_id: 'creator-789',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    profile: {
      id: 'owner-456',
      username: 'testowner',
      email: 'owner@test.com',
      wallet_address: '0x1234567890123456789012345678901234567890',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  };

  const mockOnClose = jest.fn();

  const defaultProps = {
    nft: mockNFT,
    isOpen: true,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when isOpen is true and nft is provided', () => {
    render(<NFTListModal {...defaultProps} />);

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('上架NFT出售');
    expect(screen.getByTestId('mock-list-nft-form')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(<NFTListModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-list-nft-form')).not.toBeInTheDocument();
  });

  it('should not render modal when nft is null', () => {
    render(<NFTListModal {...defaultProps} nft={null} />);

    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-list-nft-form')).not.toBeInTheDocument();
  });

  it('should not render modal when isOpen is true but nft is null', () => {
    render(<NFTListModal {...defaultProps} nft={null} isOpen={true} />);

    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-list-nft-form')).not.toBeInTheDocument();
  });

  it('should pass correct title to Modal', () => {
    render(<NFTListModal {...defaultProps} />);

    expect(screen.getByTestId('modal-title')).toHaveTextContent('上架NFT出售');
  });

  it('should pass nft to ListNFTForm', () => {
    render(<NFTListModal {...defaultProps} />);

    expect(screen.getByTestId('form-nft-id')).toHaveTextContent('nft-123');
    expect(screen.getByTestId('form-nft-name')).toHaveTextContent('Test NFT');
  });

  it('should pass onClose as onSuccess to ListNFTForm', () => {
    render(<NFTListModal {...defaultProps} />);

    const successButton = screen.getByTestId('form-success');
    successButton.click();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should pass onClose as onCancel to ListNFTForm', () => {
    render(<NFTListModal {...defaultProps} />);

    const cancelButton = screen.getByTestId('form-cancel');
    cancelButton.click();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when modal close button is clicked', () => {
    render(<NFTListModal {...defaultProps} />);

    const closeButton = screen.getByTestId('modal-close');
    closeButton.click();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle NFT with minimal data', () => {
    const minimalNFT: NFTInfo = {
      id: 'minimal-nft',
      name: 'Minimal NFT',
      description: '',
      image_url: '',
      token_id: '1',
      contract_address: '0x0000000000000000000000000000000000000000',
      owner_id: 'owner-1',
      creator_id: 'creator-1',
      collection_id: 'collection-1',
      is_listed: false,
      list_price: null,
      list_currency: null,
      last_sale_price: null,
      last_sale_currency: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      collection: null,
      profile: null,
    };

    render(<NFTListModal {...defaultProps} nft={minimalNFT} />);

    expect(screen.getByTestId('form-nft-id')).toHaveTextContent('minimal-nft');
    expect(screen.getByTestId('form-nft-name')).toHaveTextContent('Minimal NFT');
  });

  it('should handle state changes correctly', () => {
    const { rerender } = render(<NFTListModal {...defaultProps} isOpen={false} />);

    // Initially not visible
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();

    // Rerender with isOpen true
    rerender(<NFTListModal {...defaultProps} isOpen={true} />);
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

    // Rerender with nft as null
    rerender(<NFTListModal {...defaultProps} nft={null} />);
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('should handle multiple NFT changes', () => {
    const { rerender } = render(<NFTListModal {...defaultProps} />);

    expect(screen.getByTestId('form-nft-id')).toHaveTextContent('nft-123');
    expect(screen.getByTestId('form-nft-name')).toHaveTextContent('Test NFT');

    const newNFT: NFTInfo = {
      ...mockNFT,
      id: 'nft-456',
      name: 'Another NFT',
    };

    rerender(<NFTListModal {...defaultProps} nft={newNFT} />);

    expect(screen.getByTestId('form-nft-id')).toHaveTextContent('nft-456');
    expect(screen.getByTestId('form-nft-name')).toHaveTextContent('Another NFT');
  });

  it('should properly propagate modal props', () => {
    render(<NFTListModal {...defaultProps} />);

    // Modal should receive isOpen prop
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

    // Modal should receive onClose prop
    const closeButton = screen.getByTestId('modal-close');
    expect(closeButton).toBeInTheDocument();
  });

  it('should properly propagate ListNFTForm props', () => {
    render(<NFTListModal {...defaultProps} />);

    const form = screen.getByTestId('mock-list-nft-form');
    expect(form).toBeInTheDocument();

    // Should have success and cancel buttons from form
    expect(screen.getByTestId('form-success')).toBeInTheDocument();
    expect(screen.getByTestId('form-cancel')).toBeInTheDocument();
  });

  it('should render fragment wrapper correctly', () => {
    const { container } = render(<NFTListModal {...defaultProps} />);

    // The component uses React.Fragment (<>) as wrapper
    // The modal should be the first (and only) child
    expect(container.firstChild).toContainElement(screen.getByTestId('mock-modal'));
  });

  it('should handle edge case with undefined NFT properties', () => {
    const nftWithUndefinedProps = {
      ...mockNFT,
      id: undefined,
      name: undefined,
    } as any;

    render(<NFTListModal {...defaultProps} nft={nftWithUndefinedProps} />);

    expect(screen.getByTestId('mock-list-nft-form')).toBeInTheDocument();
    // Form should handle undefined values gracefully
    expect(screen.getByTestId('form-nft-id')).toBeInTheDocument();
    expect(screen.getByTestId('form-nft-name')).toBeInTheDocument();
  });

  describe('Component behavior', () => {
    it('should be a client component', () => {
      // Component uses "use client" directive for client-side rendering
      render(<NFTListModal {...defaultProps} />);
      
      // Should render interactive elements
      expect(screen.getByTestId('form-success')).toBeInTheDocument();
      expect(screen.getByTestId('form-cancel')).toBeInTheDocument();
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(<NFTListModal {...defaultProps} isOpen={false} />);

      // Rapid open/close
      rerender(<NFTListModal {...defaultProps} isOpen={true} />);
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

      rerender(<NFTListModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();

      rerender(<NFTListModal {...defaultProps} isOpen={true} />);
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    it('should handle onClose being called multiple times', () => {
      render(<NFTListModal {...defaultProps} />);

      const successButton = screen.getByTestId('form-success');
      const cancelButton = screen.getByTestId('form-cancel');
      const closeButton = screen.getByTestId('modal-close');

      // Call onClose through different paths
      successButton.click();
      cancelButton.click();
      closeButton.click();

      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration with child components', () => {
    it('should pass all required props to Modal', () => {
      render(<NFTListModal {...defaultProps} />);

      // Modal should receive correct props
      expect(screen.getByTestId('modal-title')).toHaveTextContent('上架NFT出售');
      expect(screen.getByTestId('modal-close')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('should pass all required props to ListNFTForm', () => {
      render(<NFTListModal {...defaultProps} />);

      // Form should receive NFT data
      expect(screen.getByTestId('form-nft-id')).toHaveTextContent(mockNFT.id);
      expect(screen.getByTestId('form-nft-name')).toHaveTextContent(mockNFT.name);
      
      // Form should have callback handlers
      expect(screen.getByTestId('form-success')).toBeInTheDocument();
      expect(screen.getByTestId('form-cancel')).toBeInTheDocument();
    });
  });

  describe('Conditional rendering logic', () => {
    it('should only render when both conditions are met', () => {
      // Test all combinations
      const testCases = [
        { isOpen: false, nft: null, shouldRender: false },
        { isOpen: false, nft: mockNFT, shouldRender: false },
        { isOpen: true, nft: null, shouldRender: false },
        { isOpen: true, nft: mockNFT, shouldRender: true },
      ];

      testCases.forEach(({ isOpen, nft, shouldRender }, index) => {
        const { unmount } = render(
          <NFTListModal nft={nft} isOpen={isOpen} onClose={mockOnClose} />
        );

        if (shouldRender) {
          expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
        } else {
          expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
        }

        unmount();
        jest.clearAllMocks();
      });
    });
  });
});