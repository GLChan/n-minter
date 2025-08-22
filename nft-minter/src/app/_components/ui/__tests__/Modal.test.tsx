/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from '../ui/Modal';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: ({ size, ...props }: any) => (
    <svg data-testid="x-icon" width={size} height={size} {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
}));

describe('Modal Component', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: 'Test Modal',
    children: <div data-testid="modal-content">Modal Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow style
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = '';
  });

  it('should render when isOpen is true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('should render title correctly', () => {
    render(<Modal {...defaultProps} title="Custom Title" />);

    expect(screen.getByRole('heading', { level: 3, name: 'Custom Title' })).toBeInTheDocument();
  });

  it('should render children content', () => {
    const customContent = (
      <div>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <button>Action Button</button>
      </div>
    );

    render(<Modal {...defaultProps} children={customContent} />);

    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<Modal {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when other keys are pressed', () => {
    render(<Modal {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space' });
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onClose when clicking outside modal', () => {
    render(<Modal {...defaultProps} />);

    // Click on the backdrop (outside modal)
    const backdrop = screen.getByText('Test Modal').closest('.fixed');
    fireEvent.mouseDown(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when clicking inside modal', () => {
    render(<Modal {...defaultProps} />);

    // Click on the modal content
    const modalContent = screen.getByText('Test Modal');
    fireEvent.mouseDown(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should prevent body scrolling when open', () => {
    const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);
    
    // Initially, overflow should not be set
    expect(document.body.style.overflow).toBe('');

    // When modal opens, overflow should be hidden
    rerender(<Modal {...defaultProps} isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');

    // When modal closes, overflow should be reset
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('should clean up event listeners when unmounted', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = render(<Modal {...defaultProps} />);

    // Verify event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    unmount();

    // Verify event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should have proper modal structure and styling', () => {
    const { container } = render(<Modal {...defaultProps} />);

    // Check backdrop
    const backdrop = container.querySelector('.fixed.inset-0.z-50');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'bg-black/50',
      'backdrop-blur-sm'
    );

    // Check modal container
    const modalContainer = container.querySelector('.bg-white.dark\\:bg-zinc-800.rounded-xl');
    expect(modalContainer).toBeInTheDocument();
    expect(modalContainer).toHaveClass(
      'shadow-xl',
      'w-full',
      'max-w-md',
      'mx-4',
      'overflow-hidden',
      'animate-fade-in-up'
    );
  });

  it('should have proper header styling', () => {
    const { container } = render(<Modal {...defaultProps} />);

    const header = container.querySelector('.flex.items-center.justify-between');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass(
      'border-b',
      'border-zinc-200',
      'dark:border-zinc-700',
      'px-6',
      'py-4'
    );

    const title = screen.getByText('Test Modal');
    expect(title).toHaveClass('text-lg', 'font-semibold');
  });

  it('should have proper content area styling', () => {
    const { container } = render(<Modal {...defaultProps} />);

    const contentArea = container.querySelector('.p-6');
    expect(contentArea).toBeInTheDocument();
    expect(contentArea).toContainElement(screen.getByTestId('modal-content'));
  });

  it('should have proper close button styling', () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole('button');
    expect(closeButton).toHaveClass(
      'text-zinc-500',
      'hover:text-zinc-700',
      'dark:text-zinc-400',
      'dark:hover:text-zinc-200',
      'transition-colors',
      'cursor-pointer'
    );
  });

  it('should render X icon with correct size', () => {
    render(<Modal {...defaultProps} />);

    const xIcon = screen.getByTestId('x-icon');
    expect(xIcon).toHaveAttribute('width', '20');
    expect(xIcon).toHaveAttribute('height', '20');
  });

  it('should handle rapid open/close state changes', () => {
    const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);

    // Rapidly toggle open state
    rerender(<Modal {...defaultProps} isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('');

    rerender(<Modal {...defaultProps} isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should handle multiple key presses correctly', () => {
    render(<Modal {...defaultProps} />);

    // Press Escape multiple times
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(3);
  });

  it('should handle edge case with null modal ref', () => {
    render(<Modal {...defaultProps} />);

    // Simulate clicking outside when ref is somehow null
    const mockEvent = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(mockEvent, 'target', { value: document.body });
    
    document.dispatchEvent(mockEvent);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should be accessible', () => {
    render(<Modal {...defaultProps} />);

    // Modal should be properly labeled
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();

    // Close button should be focusable
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    
    closeButton.focus();
    expect(closeButton).toHaveFocus();
  });

  it('should handle long content properly', () => {
    const longContent = (
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <p key={i}>This is paragraph {i + 1} with some content.</p>
        ))}
      </div>
    );

    render(<Modal {...defaultProps} children={longContent} />);

    expect(screen.getByText('This is paragraph 1 with some content.')).toBeInTheDocument();
    expect(screen.getByText('This is paragraph 100 with some content.')).toBeInTheDocument();
  });

  it('should handle dynamic title changes', () => {
    const { rerender } = render(<Modal {...defaultProps} title="Original Title" />);

    expect(screen.getByText('Original Title')).toBeInTheDocument();

    rerender(<Modal {...defaultProps} title="Updated Title" />);

    expect(screen.queryByText('Original Title')).not.toBeInTheDocument();
    expect(screen.getByText('Updated Title')).toBeInTheDocument();
  });

  describe('Event handling edge cases', () => {
    it('should handle onClose being undefined', () => {
      const propsWithoutOnClose = {
        ...defaultProps,
        onClose: undefined as any,
      };

      render(<Modal {...propsWithoutOnClose} />);

      // Should not throw error when clicking close or pressing Escape
      expect(() => {
        fireEvent.keyDown(document, { key: 'Escape' });
        const closeButton = screen.getByRole('button');
        fireEvent.click(closeButton);
      }).not.toThrow();
    });

    it('should handle complex click outside scenarios', () => {
      render(
        <div>
          <div data-testid="outside-element">Outside</div>
          <Modal {...defaultProps} />
        </div>
      );

      // Click on element outside modal
      const outsideElement = screen.getByTestId('outside-element');
      fireEvent.mouseDown(outsideElement);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});