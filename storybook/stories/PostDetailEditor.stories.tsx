import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import PostDetailEditor from '@/components/editor/PostDetailEditor';

type StoryComponent = StoryObj<typeof PostDetailEditor>;
type StoryTemplate = StoryFn<typeof PostDetailEditor>;

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
export default {
  component: PostDetailEditor,
  tags: ['autodocs']
} as Meta<typeof PostDetailEditor>;

const Template: StoryTemplate = (args) => {
  return <PostDetailEditor {...args} />;
};

export const Default: StoryComponent = {
  parameters: {
    docs: {
      description: {
        story: ''
      }
    }
  },
  args: {},
  render: Template
};
