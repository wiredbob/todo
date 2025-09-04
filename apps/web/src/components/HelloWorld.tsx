import React from 'react';

interface HelloWorldProps {
  name?: string;
}

export const HelloWorld: React.FC<HelloWorldProps> = ({ name = 'World' }) => {
  return (
    <div data-testid="hello-world">
      <h2>Hello, {name}!</h2>
      <p>Welcome to Simple Todo</p>
    </div>
  );
};