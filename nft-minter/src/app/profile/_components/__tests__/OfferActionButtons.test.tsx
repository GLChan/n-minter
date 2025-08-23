/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OfferActionButtons } from '../OfferActionButtons';
import { OrderItem, NFT, UserProfile } from '@/app/_lib/types';
import { NFTOrderStatus } from '@/app/_lib/types/enums';

// Mock Button component
jest.mock('@/app/_components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock wagmi hooks
const mockUseAccount = jest.fn();
const mockUseWriteContract = jest.fn();
const mockUseWaitForTransactionReceipt = jest.fn();
const mockWriteContractAsync = jest.fn();

jest.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useWriteContract: () => mockUseWriteContract(),
  useWaitForTransactionReceipt: (config: any) => mockUseWaitForTransactionReceipt(config),
}));

// Mock constants
jest.mock('@/app/_lib/constants', () => ({
  MARKETPLACE_ABI: [],
  MARKETPLACE_CONTRACT_ADDRESS: '0xMARKETPLACE123',
}));

// Mock supabase client
const mockSupabaseUpdate = jest.fn();
const mockSupabaseFrom = jest.fn(() => ({
  update: mockSupabaseUpdate.mockReturnValue({
    eq: jest.fn().mockResolvedValue({ error: null }),
  }),
}));

jest.mock('@/app/_lib/supabase/client', () => ({
  createClient: () => ({
    from: mockSupabaseFrom,
  }),
}));

// Mock react-hot-toast
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastLoading = jest.fn();

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: mockToastError,
    success: mockToastSuccess,
    loading: mockToastLoading,
  },
}));

// Mock next/navigation
const mockRouterPush = jest.fn();
const mockRouterRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('OfferActionButtons Component', () => {
  const mockNFT: NFT = {
    id: 'nft-123',
    name: 'Test NFT',
    description: 'A test NFT',
    image_url: 'https://example.com/nft.jpg',
    token_id: '1',
    contract_address: '0xNFTCONTRACT',
    owner_id: 'owner-456',
    creator_id: 'creator-789',
    collection_id: 'collection-101',
    is_listed: true,
    list_price: '1000000000000000000',
    list_currency: 'ETH',
    last_sale_price: null,
    last_sale_currency: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockOfferer: UserProfile = {
    id: 'offerer-123',
    username: 'offerer',
    email: 'offerer@test.com',
    wallet_address: '0xOFFERER',
    avatar_url: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockOffer: OrderItem = {
    id: 'offer-123',
    seller_address: '0xSELLER',
    buyer_address: '0xBUYER',
    nft_address: '0xNFTCONTRACT',
    token_id: '1',
    currency_address: '0xWETH',
    price_wei: '500000000000000000',
    nonce: 12345,
    deadline_timestamp: 1699999999,
    signature: '0xSIGNATURE',
    status: NFTOrderStatus.Active,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    nft: mockNFT,
    offerer: mockOfferer,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseAccount.mockReturnValue({ address: '0xUSER123' });
    mockUseWriteContract.mockReturnValue({
      data: null,
      writeContractAsync: mockWriteContractAsync,
      error: null,
    });
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('should render accept and reject buttons', () => {
    render(<OfferActionButtons offer={mockOffer} />);

    expect(screen.getByRole('button', { name: /接受/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /拒绝/ })).toBeInTheDocument();
  });

  it('should show error when wallet is not connected', async () => {
    mockUseAccount.mockReturnValue({ address: null });

    render(<OfferActionButtons offer={mockOffer} />);

    const acceptButton = screen.getByRole('button', { name: /接受/ });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByText('请连接钱包')).toBeInTheDocument();
    });
  });

  it('should show error when NFT info is missing', async () => {
    const offerWithoutNFT = { ...mockOffer, nft: null };

    render(<OfferActionButtons offer={offerWithoutNFT} />);

    const acceptButton = screen.getByRole('button', { name: /接受/ });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByText('NFT信息缺失')).toBeInTheDocument();
    });
  });

  it('should call writeContractAsync when accepting offer', async () => {
    render(<OfferActionButtons offer={mockOffer} />);

    const acceptButton = screen.getByRole('button', { name: /接受/ });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith({
        address: '0xMARKETPLACE123',
        abi: [],
        functionName: 'fulfillOffer',
        args: [
          {
            seller: '0xSELLER',
            buyer: '0xBUYER',
            nftAddress: '0xNFTCONTRACT',
            tokenId: BigInt('1'),
            currency: '0xWETH',
            price: BigInt('500000000000000000'),
            nonce: BigInt('12345'),
            deadline: BigInt('1699999999'),
          },
          '0xSIGNATURE',
        ],
      });
    });
  });

  it('should update offer status when rejecting offer', async () => {
    render(<OfferActionButtons offer={mockOffer} />);

    const rejectButton = screen.getByRole('button', { name: /拒绝/ });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({
        status: NFTOrderStatus.Rejected,
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('报价已拒绝并更新状态');
    expect(mockRouterRefresh).toHaveBeenCalled();
  });

  it('should disable buttons when loading', () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
    });

    render(<OfferActionButtons offer={mockOffer} />);

    const acceptButton = screen.getByRole('button', { name: /接受确认中/ });
    const rejectButton = screen.getByRole('button', { name: /拒绝/ });

    expect(acceptButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });

  it('should show loading text when transaction is confirming', () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
    });

    render(<OfferActionButtons offer={mockOffer} />);

    expect(screen.getByText('接受确认中...')).toBeInTheDocument();
  });

  it('should show wallet confirmation text when submitting', () => {
    const { rerender } = render(<OfferActionButtons offer={mockOffer} />);

    // Simulate submitting state by clicking accept
    const acceptButton = screen.getByRole('button', { name: /接受/ });
    fireEvent.click(acceptButton);

    // Rerender with submitting state
    mockUseWriteContract.mockReturnValue({
      data: null,
      writeContractAsync: mockWriteContractAsync.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      ),
      error: null,
    });

    rerender(<OfferActionButtons offer={mockOffer} />);

    expect(screen.getByText('等待钱包确认...')).toBeInTheDocument();
  });

  it('should handle contract call error', async () => {
    mockWriteContractAsync.mockRejectedValue(new Error('Contract call failed'));

    render(<OfferActionButtons offer={mockOffer} />);

    const acceptButton = screen.getByRole('button', { name: /接受/ });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining('合约调用失败')
      );
    });
  });

  it('should handle transaction confirmation success', async () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
    });

    mockUseWriteContract.mockReturnValue({
      data: '0xTXHASH',
      writeContractAsync: mockWriteContractAsync,
      error: null,
    });

    render(<OfferActionButtons offer={mockOffer} />);

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('NFT接受报价成功!');
      expect(mockRouterPush).toHaveBeenCalledWith('/profile?tab=nft');
    });
  });

  it('should handle transaction confirmation error', async () => {
    const transactionError = new Error('Transaction failed');
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: transactionError,
    });

    mockUseWriteContract.mockReturnValue({
      data: '0xTXHASH',
      writeContractAsync: mockWriteContractAsync,
      error: null,
    });

    render(<OfferActionButtons offer={mockOffer} />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining('接受报价交易确认失败')
      );
    });
  });

  it('should record transaction after successful confirmation', async () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
    });

    mockUseWriteContract.mockReturnValue({
      data: '0xTXHASH123',
      writeContractAsync: mockWriteContractAsync,
      error: null,
    });

    render(<OfferActionButtons offer={mockOffer} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/transaction/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nftId: 'nft-123',
          transactionType: 'sale',
          transactionHash: '0xTXHASH123',
          price: '500000000000000000',
          sellerAddress: '0xSELLER',
          buyerAddress: '0xBUYER',
        }),
      });
    });
  });

  it('should handle database error when rejecting offer', async () => {
    const dbError = new Error('Database error');
    mockSupabaseFrom.mockReturnValue({
      update: mockSupabaseUpdate.mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: dbError }),
      }),
    });

    render(<OfferActionButtons offer={mockOffer} />);

    const rejectButton = screen.getByRole('button', { name: /拒绝/ });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.stringContaining('拒绝报价失败')
      );
    });
  });

  it('should show reject button loading state', async () => {
    // Mock a slow supabase update
    mockSupabaseFrom.mockReturnValue({
      update: mockSupabaseUpdate.mockReturnValue({
        eq: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
        ),
      }),
    });

    render(<OfferActionButtons offer={mockOffer} />);

    const rejectButton = screen.getByRole('button', { name: /拒绝/ });
    fireEvent.click(rejectButton);

    expect(screen.getByText('处理中...')).toBeInTheDocument();
  });

  it('should have proper button styling', () => {
    render(<OfferActionButtons offer={mockOffer} />);

    const acceptButton = screen.getByRole('button', { name: /接受/ });
    const rejectButton = screen.getByRole('button', { name: /拒绝/ });

    expect(acceptButton).toHaveAttribute('data-variant', 'primary');
    expect(acceptButton).toHaveAttribute('data-size', 'sm');
    expect(rejectButton).toHaveAttribute('data-variant', 'secondary');
    expect(rejectButton).toHaveAttribute('data-size', 'sm');
  });

  it('should have proper container styling', () => {
    const { container } = render(<OfferActionButtons offer={mockOffer} />);

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass(
      'flex',
      'flex-col',
      'sm:flex-row',
      'gap-2',
      'flex-shrink-0',
      'ml-auto'
    );
  });

  describe('Edge cases', () => {
    it('should handle missing offer data gracefully', () => {
      const incompleteOffer = {
        ...mockOffer,
        price_wei: null,
        token_id: null,
      } as any;

      render(<OfferActionButtons offer={incompleteOffer} />);

      expect(screen.getByRole('button', { name: /接受/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /拒绝/ })).toBeInTheDocument();
    });

    it('should handle transaction recording failure', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Recording failed'));

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
      });

      mockUseWriteContract.mockReturnValue({
        data: '0xTXHASH',
        writeContractAsync: mockWriteContractAsync,
        error: null,
      });

      render(<OfferActionButtons offer={mockOffer} />);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          expect.stringContaining('交易记录失败')
        );
      });
    });
  });

  describe('Loading states', () => {
    it('should show loading toast when transaction is confirming', async () => {
      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      mockUseWriteContract.mockReturnValue({
        data: '0xTXHASH',
        writeContractAsync: mockWriteContractAsync,
        error: null,
      });

      render(<OfferActionButtons offer={mockOffer} />);

      await waitFor(() => {
        expect(mockToastLoading).toHaveBeenCalledWith(
          '正在确认购买交易，请稍候...'
        );
      });
    });
  });
});