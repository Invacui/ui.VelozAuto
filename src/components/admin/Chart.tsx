import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface ChartProps {
  options: ApexOptions;
  series: ApexOptions['series'];
  type?: 'line' | 'area' | 'bar' | 'donut' | 'pie';
  height?: number;
}

/** Thin wrapper around react-apexcharts with project defaults. */
export function Chart({ options, series, type = 'area', height = 280 }: ChartProps) {
  return (
    <ReactApexChart
      type={type}
      height={height}
      options={{
        chart: { toolbar: { show: false }, fontFamily: 'inherit', ...options.chart },
        ...options,
      }}
      series={series}
    />
  );
}

export default Chart;
