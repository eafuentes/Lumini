import React from 'react';
import { View, Text } from 'react-native';
import { Prompt, Item } from '../types';

interface PromptRendererProps {
  prompt: Prompt;
}

/**
 * Renders a single prompt with its items
 * Visual-first, no reading required approach
 */
export const PromptRenderer: React.FC<PromptRendererProps> = ({ prompt }: PromptRendererProps) => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      {/* Instruction text */}
      <Text className="text-2xl font-bold text-gray-900 mb-8 text-center">
        {prompt.instruction}
      </Text>

      {/* Items grid */}
      <View className="flex-row flex-wrap justify-center gap-4">
        {prompt.items.map((item: Item) => (
          <View
            key={item.id}
            className="w-20 h-20 bg-white rounded-lg border-2 border-gray-200 justify-center items-center"
          >
            <Text className="text-4xl">{item.value || item.assetKey}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PromptRenderer;
