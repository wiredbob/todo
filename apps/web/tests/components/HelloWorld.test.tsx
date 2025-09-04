import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HelloWorld } from '../../src/components/HelloWorld';

describe('HelloWorld Component', () => {
  it('renders with default name', () => {
    render(<HelloWorld />);
    
    expect(screen.getByTestId('hello-world')).toBeInTheDocument();
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Simple Todo')).toBeInTheDocument();
  });

  it('renders with custom name', () => {
    render(<HelloWorld name="Developer" />);
    
    expect(screen.getByText('Hello, Developer!')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Simple Todo')).toBeInTheDocument();
  });

  it('renders heading and welcome message', () => {
    render(<HelloWorld name="Test" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Hello, Test!');
    
    const paragraph = screen.getByText('Welcome to Simple Todo');
    expect(paragraph).toBeInTheDocument();
  });
});