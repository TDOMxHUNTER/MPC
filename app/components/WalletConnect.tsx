
'use client';

import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

interface WalletConnectProps {
  projectId: string;
}

export default function WalletConnect({ projectId }: WalletConnectProps) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      const { modal } = await import('../config/web3');
      modal.open();
    } catch (error) {
      console.warn('Failed to open wallet modal:', error);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (error) {
      console.warn('Failed to disconnect wallet:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div style={{
      position: 'relative',
      zIndex: 1000
    }}>
      {isConnected && address ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'flex-end'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
