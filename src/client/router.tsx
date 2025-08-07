import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import TVApp from './routes/tv/TVApp';
import ControllerApp from './routes/controller/ControllerApp';

export const router = createBrowserRouter([
  { path: '/', element: <TVApp /> },
  { path: '/controller', element: <ControllerApp /> },
]);



