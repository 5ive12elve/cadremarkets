import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PhoneInput from './PhoneInput';

describe('PhoneInput Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default props', () => {
    render(<PhoneInput value="" onChange={mockOnChange} />);
    
    // Check if the phone input is rendered
    const phoneInput = screen.getByRole('textbox');
    expect(phoneInput).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    const testValue = '+1234567890';
    render(<PhoneInput value={testValue} onChange={mockOnChange} />);
    
    const phoneInput = screen.getByRole('textbox');
    expect(phoneInput).toHaveValue(testValue);
  });

  it('calls onChange when value changes', () => {
    render(<PhoneInput value="" onChange={mockOnChange} />);
    
    const phoneInput = screen.getByRole('textbox');
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('+1234567890');
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Invalid phone number';
    render(<PhoneInput value="" onChange={mockOnChange} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-phone-input';
    render(<PhoneInput value="" onChange={mockOnChange} className={customClass} />);
    
    const phoneInputContainer = screen.getByRole('textbox').closest('.PhoneInput');
    expect(phoneInputContainer).toHaveClass(customClass);
  });

  it('supports RTL direction', () => {
    render(<PhoneInput value="" onChange={mockOnChange} dir="rtl" />);
    
    const phoneInput = screen.getByRole('textbox');
    expect(phoneInput).toHaveAttribute('dir', 'rtl');
  });

  it('shows placeholder text', () => {
    const placeholder = 'Enter phone number';
    render(<PhoneInput value="" onChange={mockOnChange} placeholder={placeholder} />);
    
    const phoneInput = screen.getByRole('textbox');
    expect(phoneInput).toHaveAttribute('placeholder', placeholder);
  });
}); 