'use server';
/**
 * @fileOverview Summarizes key details of an asset using GenAI.
 *
 * - summarizeAsset - A function that summarizes asset details.
 * - AssetSummaryInput - The input type for the summarizeAsset function.
 * - AssetSummaryOutput - The return type for the summarizeAsset function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssetSummaryInputSchema = z.object({
  name: z.string().describe('Name of the asset'),
  summary: z.string().describe('Brief description of the asset'),
  dateAcquired: z.string().describe('Date the asset was acquired'),
  costOfAcquisition: z.number().describe('Cost of acquiring the asset'),
  businessPurpose: z.string().describe('Business purpose of the asset'),
  technicalDetails: z.string().describe('Technical details of the asset'),
  type: z.string().describe('Type of asset (e.g., Software, Hardware)'),
  subCategoryType: z.string().describe('Sub-category of the asset'),
});
export type AssetSummaryInput = z.infer<typeof AssetSummaryInputSchema>;

const AssetSummaryOutputSchema = z.object({
  summary: z.string().describe('A GenAI-generated summary of the asset details.'),
});
export type AssetSummaryOutput = z.infer<typeof AssetSummaryOutputSchema>;

export async function summarizeAsset(input: AssetSummaryInput): Promise<AssetSummaryOutput> {
  return assetSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assetSummaryPrompt',
  input: {schema: AssetSummaryInputSchema},
  output: {schema: AssetSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes asset details.

  Summarize the key details of the following asset, focusing on its purpose, specifications, and any other relevant information:

  Asset Name: {{name}}
  Summary: {{summary}}
  Date Acquired: {{dateAcquired}}
  Cost of Acquisition: {{costOfAcquisition}}
  Business Purpose: {{businessPurpose}}
  Technical Details: {{technicalDetails}}
  Type: {{type}}
  Sub-category Type: {{subCategoryType}}
  \n  Provide a concise summary that allows users to quickly understand the asset.\n`,
});

const assetSummaryFlow = ai.defineFlow(
  {
    name: 'assetSummaryFlow',
    inputSchema: AssetSummaryInputSchema,
    outputSchema: AssetSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
