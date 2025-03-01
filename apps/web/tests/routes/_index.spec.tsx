import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Index from '../../app/routes/_index';
import { useFetcher } from '@remix-run/react';
import '@testing-library/jest-dom';
import { messagePrefixes } from '../../app/data/messages';
import userEvent from '@testing-library/user-event';

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
    expect(screen.getByTestId('pet-description-ta')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Find suitable pets/i })
    ).toBeDisabled();
  });

  it('enables the submit button when input is filled', () => {
    render(<Index />);
    const textarea = screen.getByTestId('pet-description-ta');
    const button = screen.getByRole('button', {
      name: /Find suitable pets/i,
    });

    fireEvent.change(textarea, { target: { value: 'Ich suche eine Katze' } });
    expect(button).not.toBeDisabled();
  });

  it('updates input when selecting an example query', async () => {
    render(<Index />);

    // Open the dropdown
    const select = screen.getByTestId('example-query-select');
    await userEvent.click(select);

    // Find the correct option using role="option"
    const option = await screen.findByRole('option', {
      name: messagePrefixes[0].label,
    });

    // Click the correct option inside the dropdown
    await userEvent.click(option);

    // Wait for the input to update
    await waitFor(() => {
      expect(screen.getByTestId('pet-description-ta')).toHaveValue(
        messagePrefixes[0].key
      );
    });
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
      name: /Find suitable pets/i,
    });

    expect(button).toBeDisabled();
  });

  it('displays pets when API returns results', async () => {
    const mockPets = [
      {
        id: '1',
        image: 'https://example.com/dog.jpg',
        answer: 'Ein süßer Hund zum Adoptieren!',
        url: 'https://example.com/dog-profile',
      },
    ];

    (useFetcher as jest.Mock).mockReturnValue({
      state: 'idle',
      Form: jest.fn(({ children }: { children: React.ReactNode }) => (
        <form>{children}</form>
      )),
      data: {
        generalAnswer: 'Hier sind einige Haustiere:',
        individualPetAnswers: mockPets,
      },
    });

    render(<Index />);

    await waitFor(() => {
      expect(
        screen.getByText('Hier sind einige Haustiere:')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Ein süßer Hund zum Adoptieren!')
      ).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /1/ })).toHaveAttribute(
        'src',
        mockPets[0].image
      );
      expect(
        screen.getByRole('link', {
          name: /https:\/\/example.com\/dog-profile/i,
        })
      ).toBeInTheDocument();
    });
  });
});
