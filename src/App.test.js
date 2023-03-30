import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app and checks if nasa logo present', () => {
  render(<App />);
  //const linkElement = screen.getByText(/Copyright/i);
  const linkElement = screen.getByAltText(/nasa logo/i)
  expect(linkElement).toBeInTheDocument();
});
