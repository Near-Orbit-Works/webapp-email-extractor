# Night Owl Email Extraction and Merge Tool

A lightweight browser-based tool that extracts email addresses from CSV files, deduplicates and alphabetizes the address list, and outputs the emails into Outlook-ready batches of 490 addresses per column in a new .csv file.

Built to work with .csv files only. Ensure your file has an 'email' column of some type.

## What it does
- Upload up to 5 CSV files
- Automatically detects columns containing the word `email`
- Extracts email addresses
- Removes duplicate addresses
- Alphabetizes resulting list of email addresses
- Splits output into columns of 490 emails per column to play nicely with Outlook (500 address limit)
- Downloads a ready-to-use CSV file of just the addresses.

## Why this tool exists
Our original Python desktop app worked well, but distributing executable files created unnecessary friction:
- Windows security warnings
- Mac compatibility issues
- Software installation barriers

This web version solves that by running entirely in the browser.

## Privacy
All file processing happens locally in your browser.

Uploaded files are:
- not sent to a server
- not stored
- not tracked
- not shared

## Tech Stack
- HTML
- CSS
- Vanilla JavaScript
- Papa Parse
- GitHub Pages

## File Requirements
Your uploaded CSV must contain a column with the word:

`email`

Examples:
- Email
- StudentEmail
- student_email_address

## Output
The tool generates:

`merged_cohort_emails_YYYY-MM-DD.csv`

Each output column contains a maximum of 490 email addresses for Outlook-friendly sending.

## Local Development
Clone repo:

```bash
git clone [your repo url]
'''

## Credits
Developed by Dr. Lori Ramey on behalf of the MSCIN instructor team to assist with outreach and event announcements,
(With deep respect for everyone who has ever manually copied email addresses into Outlook and questioned their life choices).
May 2026
BSD 3-clause license
