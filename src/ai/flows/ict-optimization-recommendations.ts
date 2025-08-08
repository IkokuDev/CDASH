'use server';

/**
 * @fileOverview An AI agent that provides recommendations for optimizing ICT resource allocation.
 *
 * - getICTOptimizationRecommendations - A function that generates ICT optimization recommendations.
 * - ICTOptimizationRecommendationsInput - The input type for the getICTOptimizationRecommendations function.
 * - ICTOptimizationRecommendationsOutput - The return type for the getICTOptimizationRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ICTOptimizationRecommendationsInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'Historical data of ICT resource allocation, including spending, utilization, and performance metrics.'
    ),
});
export type ICTOptimizationRecommendationsInput = z.infer<
  typeof ICTOptimizationRecommendationsInputSchema
>;

const ICTOptimizationRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'AI-powered recommendations for optimizing ICT resource allocation.'
    ),
});
export type ICTOptimizationRecommendationsOutput = z.infer<
  typeof ICTOptimizationRecommendationsOutputSchema
>;

export async function getICTOptimizationRecommendations(
  input: ICTOptimizationRecommendationsInput
): Promise<ICTOptimizationRecommendationsOutput> {
  return ictOptimizationRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ictOptimizationRecommendationsPrompt',
  input: {schema: ICTOptimizationRecommendationsInputSchema},
  output: {schema: ICTOptimizationRecommendationsOutputSchema},
  prompt: `You are an expert ICT resource allocation optimizer.

  Based on the historical data provided, generate recommendations for optimizing ICT resource allocation.

  Historical Data: {{{historicalData}}}`,
});

const ictOptimizationRecommendationsFlow = ai.defineFlow(
  {
    name: 'ictOptimizationRecommendationsFlow',
    inputSchema: ICTOptimizationRecommendationsInputSchema,
    outputSchema: ICTOptimizationRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
