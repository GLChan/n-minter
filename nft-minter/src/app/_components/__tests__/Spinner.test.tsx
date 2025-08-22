/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Spinner from '../Spinner';

describe('Spinner Component', () => {
  it('should render spinner element', () => {
    const { container } = render(<Spinner />);
    
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner');
  });

  it('should have correct className', () => {
    const { container } = render(<Spinner />);
    
    const spinnerDiv = container.querySelector('.spinner');
    expect(spinnerDiv).toBeInTheDocument();
  });

  it('should render as div element', () => {
    const { container } = render(<Spinner />);
    
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    expect(container.firstChild).toHaveClass('spinner');
  });

  it('should render only one spinner element', () => {
    const { container } = render(<Spinner />);
    
    const spinners = container.querySelectorAll('.spinner');
    expect(spinners).toHaveLength(1);
  });
});