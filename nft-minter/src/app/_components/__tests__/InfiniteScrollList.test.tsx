/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InfiniteScrollList, MessagePlaceholder } from '../InfiniteScrollList';

// Mock the useInfiniteScroll hook
const mockUseInfiniteScroll = jest.fn();
jest.mock('../../_lib/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: () => mockUseInfiniteScroll(),
}));

// Mock intersection observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

interface TestItem {
  id: string;
  name: string;
}

describe('InfiniteScrollList Component', () => {
  const mockFetchFn = jest.fn();
  const mockRenderItem = jest.fn((item: TestItem) => (
    <div data-testid={`item-${item.id}`}>{item.name}</div>
  ));

  const defaultProps = {
    fetchFn: mockFetchFn,
    renderItem: mockRenderItem,
  };

  const mockLoaderRef = { current: null };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: false,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: null,
    });
  });

  it('should render loading state', () => {
    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: true,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('should render custom loading placeholder', () => {
    const customLoader = <div data-testid="custom-loader">Custom Loading...</div>;

    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: true,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(
      <InfiniteScrollList {...defaultProps} loadingPlaceholder={customLoader} />
    );

    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
  });

  it('should render data items', () => {
    const mockData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
    ];

    mockUseInfiniteScroll.mockReturnValue({
      data: mockData,
      loading: false,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should call renderItem for each data item', () => {
    const mockData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    mockUseInfiniteScroll.mockReturnValue({
      data: mockData,
      loading: false,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(mockRenderItem).toHaveBeenCalledTimes(2);
    expect(mockRenderItem).toHaveBeenCalledWith({ id: '1', name: 'Item 1' });
    expect(mockRenderItem).toHaveBeenCalledWith({ id: '2', name: 'Item 2' });
  });

  it('should render error message', () => {
    const mockError = new Error('Failed to fetch');

    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: false,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: mockError,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.getByText('errorMessage')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: false,
      hasMore: false,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('should render custom empty placeholder', () => {
    const customEmpty = <div data-testid="custom-empty">No items found</div>;

    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: false,
      hasMore: false,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(
      <InfiniteScrollList {...defaultProps} emptyPlaceholder={customEmpty} />
    );

    expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
  });

  it('should render "no more data" message', () => {
    const mockData = [{ id: '1', name: 'Item 1' }];

    mockUseInfiniteScroll.mockReturnValue({
      data: mockData,
      loading: false,
      hasMore: false,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.getByText('没有更多数据了')).toBeInTheDocument();
  });

  it('should not render "no more data" when loading', () => {
    const mockData = [{ id: '1', name: 'Item 1' }];

    mockUseInfiniteScroll.mockReturnValue({
      data: mockData,
      loading: true,
      hasMore: false,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.queryByText('没有更多数据了')).not.toBeInTheDocument();
  });

  it('should not render "no more data" when no data', () => {
    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: false,
      hasMore: false,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.queryByText('没有更多数据了')).not.toBeInTheDocument();
  });

  it('should use custom container', () => {
    const mockData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    const customContainer = (children: React.ReactNode) => (
      <div data-testid="custom-container" className="grid grid-cols-2">
        {children}
      </div>
    );

    mockUseInfiniteScroll.mockReturnValue({
      data: mockData,
      loading: false,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(
      <InfiniteScrollList {...defaultProps} container={customContainer} />
    );

    expect(screen.getByTestId('custom-container')).toBeInTheDocument();
    expect(screen.getByTestId('custom-container')).toHaveClass('grid', 'grid-cols-2');
  });

  it('should use custom pageSize', () => {
    render(<InfiniteScrollList {...defaultProps} pageSize={50} />);

    expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
      fetchFn: mockFetchFn,
      pageSize: 50,
    });
  });

  it('should use default pageSize when not provided', () => {
    render(<InfiniteScrollList {...defaultProps} />);

    expect(mockUseInfiniteScroll).toHaveBeenCalledWith({
      fetchFn: mockFetchFn,
      pageSize: 20,
    });
  });

  it('should render loader ref element', () => {
    const { container } = render(<InfiniteScrollList {...defaultProps} />);

    const loaderRefElement = container.querySelector('div:last-child');
    expect(loaderRefElement).toBeInTheDocument();
  });

  it('should handle complex data rendering', () => {
    interface ComplexItem {
      id: string;
      title: string;
      description: string;
      price: number;
    }

    const complexRenderItem = (item: ComplexItem) => (
      <div data-testid={`complex-item-${item.id}`}>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <span>${item.price}</span>
      </div>
    );

    const mockComplexData = [
      {
        id: '1',
        title: 'NFT Art',
        description: 'Beautiful digital art',
        price: 100,
      },
      {
        id: '2',
        title: 'Crypto Punk',
        description: 'Rare collectible',
        price: 500,
      },
    ];

    mockUseInfiniteScroll.mockReturnValue({
      data: mockComplexData,
      loading: false,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(
      <InfiniteScrollList
        fetchFn={mockFetchFn}
        renderItem={complexRenderItem}
      />
    );

    expect(screen.getByTestId('complex-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('complex-item-2')).toBeInTheDocument();
    expect(screen.getByText('NFT Art')).toBeInTheDocument();
    expect(screen.getByText('Beautiful digital art')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('should handle loading state with existing data', () => {
    const mockData = [{ id: '1', name: 'Item 1' }];

    mockUseInfiniteScroll.mockReturnValue({
      data: mockData,
      loading: true,
      hasMore: true,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    // Should show both existing data and loading message
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('should not show empty state when error exists', () => {
    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: false,
      hasMore: false,
      loaderRef: mockLoaderRef,
      error: new Error('Test error'),
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.getByText('errorMessage')).toBeInTheDocument();
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
  });

  it('should not show empty state when loading', () => {
    mockUseInfiniteScroll.mockReturnValue({
      data: [],
      loading: true,
      hasMore: false,
      loaderRef: mockLoaderRef,
      error: null,
    });

    render(<InfiniteScrollList {...defaultProps} />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();
    expect(screen.queryByText('暂无数据')).not.toBeInTheDocument();
  });
});

describe('MessagePlaceholder Component', () => {
  it('should render default message', () => {
    render(<MessagePlaceholder />);

    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<MessagePlaceholder message="自定义消息" />);

    expect(screen.getByText('自定义消息')).toBeInTheDocument();
  });

  it('should render children', () => {
    const children = <div data-testid="custom-children">Custom Content</div>;

    render(<MessagePlaceholder children={children} />);

    expect(screen.getByTestId('custom-children')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('should render message and children together', () => {
    const children = <div data-testid="icon">📷</div>;

    render(
      <MessagePlaceholder message="No photos found" children={children} />
    );

    expect(screen.getByText('No photos found')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<MessagePlaceholder message="Test" />);

    const placeholderDiv = container.firstChild as HTMLElement;
    expect(placeholderDiv).toHaveClass('text-center', 'py-12');

    const messageP = screen.getByText('Test');
    expect(messageP).toHaveClass('text-zinc-500', 'dark:text-zinc-400');
  });

  it('should render children in proper container', () => {
    const children = <span data-testid="test-children">Test</span>;

    const { container } = render(
      <MessagePlaceholder children={children} />
    );

    const childrenContainer = container.querySelector('.mb-4');
    expect(childrenContainer).toBeInTheDocument();
    expect(childrenContainer).toContainElement(screen.getByTestId('test-children'));
  });

  it('should not render children container when no children', () => {
    const { container } = render(<MessagePlaceholder message="Test" />);

    const childrenContainer = container.querySelector('.mb-4');
    expect(childrenContainer).not.toBeInTheDocument();
  });
});