export const widgetStudioEn = {
  widgetStudio: {
    title: 'AI Widget Studio',
    subtitle: 'Powered by Gemini',
    generate: {
      label: 'Generate',
      promptPlaceholder: 'Describe the widget you want to create…',
      submit: 'Generate',
      submitting: 'Generating…',
    },
    history: {
      label: 'History',
      empty: 'No widgets generated yet',
    },
    pipeline: {
      label: 'Agent Pipeline',
      progress: 'Pipeline Progress',
      agents: {
        requirement: 'Requirement Agent',
        design: 'Design Agent',
        component: 'Component Agent',
        validation: 'Validation Agent',
        preview: 'Preview Agent',
        publish: 'Publish Agent',
      },
    },
    publish: {
      button: 'Publish to Dashboard',
      confirmTitle: 'Publish Widget',
      confirmSubtitle: 'Add this widget to your dashboard',
      confirmButton: 'Publish to Dashboard',
      success: 'Widget published to your dashboard!',
    },
    errors: {
      noApiKey: 'AI Widget Studio service is not available. Please contact your administrator.',
      injectionDetected: 'Your prompt contains patterns that cannot be processed for security reasons.',
    },
  },
}

export default widgetStudioEn
