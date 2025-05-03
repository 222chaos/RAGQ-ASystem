declare module 'echarts-for-react' {
  import React from 'react';

  interface ReactEChartsProps {
    option: any;
    notMerge?: boolean;
    lazyUpdate?: boolean;
    style?: React.CSSProperties;
    className?: string;
    theme?: string | object;
    onChartReady?: (instance: any) => void;
    showLoading?: boolean;
    loadingOption?: object;
    onEvents?: Record<string, Function>;
    opts?: {
      devicePixelRatio?: number;
      renderer?: 'canvas' | 'svg';
      width?: number | string | null;
      height?: number | string | null;
    };
  }

  export default class ReactECharts extends React.Component<ReactEChartsProps> {
    getEchartsInstance: () => any;
  }
}
