import { render, screen, fireEvent } from '@testing-library/react';
import Index from '../../app/routes/_index';
import { useFetcher } from '@remix-run/react';
import '@testing-library/jest-dom';

jest.mock('@remix-run/react', () => ({
  ...jest.requireActual('@remix-run/react'),
  useFetcher: jest.fn(),
}));

describe('Index Page', () => {
  beforeEach(() => {
    (useFetcher as jest.Mock).mockReturnValue({
      state: 'idle',
      Form: jest.fn(({ children }: { children: React.ReactNode }) => (
        <form>{children}</form>
      )),
      data: null,
    });
  });

  it('renders the form correctly', () => {
    render(<Index />);
    expect(
      screen.getByLabelText('Schreiben Sie hier, wonach Sie suchen:')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Passende Haustiere finden/i })
    ).toBeDisabled();
  });

  it('enables the submit button when input is filled', () => {
    render(<Index />);
    const textarea = screen.getByLabelText(
      'Schreiben Sie hier, wonach Sie suchen:'
    );
    const button = screen.getByRole('button', {
      name: /Passende Haustiere finden/i,
    });

    fireEvent.change(textarea, { target: { value: 'Ich suche eine Katze' } });
    expect(button).not.toBeDisabled();
  });

  it('shows loading state when submitting', () => {
    (useFetcher as jest.Mock).mockReturnValueOnce({
      state: 'submitting',
      Form: jest.fn(({ children }: { children: React.ReactNode }) => (
        <form>{children}</form>
      )),
      data: null,
    });

    render(<Index />);
    const button = screen.getByRole('button', {
      name: /Passende Haustiere finden/i,
    });

    expect(button).toBeDisabled(); // ✅ Check if the button is disabled during loading
  });
});
