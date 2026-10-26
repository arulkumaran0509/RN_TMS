import React from 'react';
import AppLoader from './AppLoader';

const LoadingSpinner = ({ message = 'Loading tickets...', icon = 'ticket' }) => {
    return <AppLoader message={message} icon={icon} />;
};

export default LoadingSpinner;
