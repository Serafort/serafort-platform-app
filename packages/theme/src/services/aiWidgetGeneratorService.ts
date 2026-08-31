import React from 'react';
import { globalWidgetRegistry } from '../registry/WidgetRegistry';
import DynamicAiWidget, { type DynamicAiWidgetSpec } from '../components/widgets/DynamicAiWidget';
import type { WidgetCatalogItem } from '../components/widgets/WidgetMarketplaceDrawer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

/**
 * Local Template Widget Generator — Generates preview/sample widget specifications
 * locally for instant prototyping and demo purposes.
 */
class TemplateWidgetGeneratorService {
  private generatedCount = 0;

  generateWidget(prompt: string): { spec: DynamicAiWidgetSpec; catalogItem: WidgetCatalogItem } {
    this.generatedCount++;
    const id = `template-widget-${Date.now()}-${this.generatedCount}`;
    const cleanPrompt = prompt.trim();
    const lower = cleanPrompt.toLowerCase();

    let widgetSpec: DynamicAiWidgetSpec;

    if (lower.includes('chart') || lower.includes('mrr') || lower.includes('sales') || lower.includes('revenue')) {
      widgetSpec = {
        id,
        title: cleanPrompt.length > 30 ? 'Revenue & Growth Analytics' : cleanPrompt,
        subtitle: 'Sample Chart Widget',
        type: 'bar-chart',
        prompt: cleanPrompt,
        items: [
          { label: 'Q1', value: '$42k', percentage: 40, color: 'primary' },
          { label: 'Q2', value: '$68k', percentage: 65, color: 'primary' },
          { label: 'Q3', value: '$94k', percentage: 90, color: 'success' },
          { label: 'Q4 (Est)', value: '$110k', percentage: 100, color: 'info' },
        ],
      };
    } else if (lower.includes('cpu') || lower.includes('health') || lower.includes('server') || lower.includes('gauge') || lower.includes('load')) {
      widgetSpec = {
        id,
        title: 'Infrastructure Health Monitor',
        subtitle: 'Real-time Server Telemetry',
        type: 'progress-gauges',
        prompt: cleanPrompt,
        items: [
          { label: 'CPU Utilization', value: '78%', percentage: 78, color: 'warning' },
          { label: 'Memory Allocation', value: '62%', percentage: 62, color: 'primary' },
          { label: 'Storage Usage', value: '45%', percentage: 45, color: 'info' },
          { label: 'Network Throughput', value: '91%', percentage: 91, color: 'success' },
        ],
      };
    } else {
      widgetSpec = {
        id,
        title: cleanPrompt.length > 35 ? `${cleanPrompt.substring(0, 35)}...` : cleanPrompt,
        subtitle: 'GenAI Live Metrics',
        type: 'metric-cards',
        prompt: cleanPrompt,
        items: [
          { label: 'Active Sessions', value: '2,840', trend: 'up', trendValue: '+18%' },
          { label: 'Conversion Rate', value: '4.2%', trend: 'up', trendValue: '+0.8%' },
          { label: 'Avg Latency', value: '14ms', trend: 'down', trendValue: '-3ms' },
          { label: 'Error Rate', value: '0.02%', trend: 'down', trendValue: '-0.01%' },
        ],
      };
    }

    // Create dynamic React component wrapper using React.createElement for pure .ts compatibility
    const GeneratedWidgetComponent: React.FC = () => React.createElement(DynamicAiWidget, { spec: widgetSpec });

    // Register into globalWidgetRegistry dynamically at runtime!
    globalWidgetRegistry.register({
      id,
      titleKey: widgetSpec.title,
      Component: GeneratedWidgetComponent,
    });

    const catalogItem: WidgetCatalogItem = {
      id,
      title: widgetSpec.title,
      description: `GenAI custom widget created from prompt: "${cleanPrompt}"`,
      category: 'analytics',
      defaultSpan: 4,
      defaultHeight: 280,
      icon: React.createElement(AutoAwesomeIcon, { color: 'primary' }),
    };

    return { spec: widgetSpec, catalogItem };
  }
}

export const aiWidgetGeneratorService = new TemplateWidgetGeneratorService();
export default aiWidgetGeneratorService;

