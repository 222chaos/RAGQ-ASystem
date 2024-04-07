'use client';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { useServerInsertedHTML } from 'next/navigation';
import React from 'react';

const cache = createCache();

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => {
    const styleText = extractStyle(cache, true);
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: styleText,
        }}
      />
    );
  });

  if (typeof window !== 'undefined') return <>{children}</>;

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
