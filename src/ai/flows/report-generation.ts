'use server';

/**
 * @fileOverview An AI agent that generates detailed reports based on various criteria.
 *
 * - generateReport - A function that generates a detailed report.
 * - ReportGenerationInput - The input type for the generateReport function.
 * - ReportGenerationOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportGenerationInputSchema = z.object({
  reportType: z.string().describe('The type of report to generate (e.g., "Comprehensive Asset Analysis", "Expenditure Overview").'),
  dateFrom: z.string().optional().describe('The start date for the report period.'),
  dateTo: z.string().optional().describe('The end date for the report period.'),
  assetTypes: z.array(z.string()).optional().describe('A list of asset types to include in the report.'),
  staffDetails: z.string().optional().describe('Details about staff members to include in the report.'),
  additionalNotes: z.string().optional().describe('Any additional notes or requirements for the report.'),
  assetData: z.string().describe('JSON string representing the asset data.'),
  staffData: z.string().describe('JSON string representing the staff data.'),
});
export type ReportGenerationInput = z.infer<typeof ReportGenerationInputSchema>;

const ReportGenerationOutputSchema = z.object({
  report: z.string().describe('The generated report in Markdown format.'),
});
export type ReportGenerationOutput = z.infer<typeof ReportGenerationOutputSchema>;

export async function generateReport(input: ReportGenerationInput): Promise<ReportGenerationOutput> {
  return reportGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportGenerationPrompt',
  input: {schema: ReportGenerationInputSchema},
  output: {schema: ReportGenerationOutputSchema},
  prompt: `You are an expert ICT analyst tasked with generating a detailed report.

  Report Request Details:
  - Report Type: {{reportType}}
  {{#if dateFrom}}- Start Date: {{dateFrom}}{{/if}}
  {{#if dateTo}}- End Date: {{dateTo}}{{/if}}
  {{#if assetTypes}}- Asset Types: {{#each assetTypes}}{{{this}}}{{/each}}{{/if}}
  {{#if staffDetails}}- Staff to Include: {{staffDetails}}{{/if}}
  {{#if additionalNotes}}- Additional Notes: {{additionalNotes}}{{/if}}

  Available Data:
  - Asset Inventory: {{{assetData}}}
  - Staff Directory: {{{staffData}}}

  Please generate a comprehensive report in Markdown format based on the user's request and the provided data. The report should be well-structured, insightful, and directly address the specified requirements. Analyze the data to provide summaries, identify trends, and offer recommendations where applicable.`,
});

const reportGenerationFlow = ai.defineFlow(
  {
    name: 'reportGenerationFlow',
    inputSchema: ReportGenerationInputSchema,
    outputSchema: ReportGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
