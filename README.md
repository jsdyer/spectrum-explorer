# Spectrum Explorer

[Spectrum Explorer](https://coolcode.ca/spectrum-explorer/) · [CoolCode](https://coolcode.ca/)

Look up a Canadian frequency band and compare published transmitter records by province and territory.

<!-- coolcode:guide -->
Enter 3550 MHz to open the 3500–3650 MHz band. Compare BC and Nova Scotia in the regional table and follow the link to Spectrum Atlas to inspect individual sites.
<!-- /coolcode:guide -->

## Allocation and licence records

A frequency lookup returns the national allocation containing the entered frequency in kHz, MHz or GHz. Search the official service wording, including secondary services, or move to an adjacent band. The regional table ranks all ten provinces and three territories by published transmitter rows or distinct coordinate pairs. Follow [Spectrum Atlas](https://coolcode.ca/spectrumatlas/) to inspect the individual mapped records.

The 2026 allocation table has 535 consecutive ranges. The November 3, 2026 terrestrial site extract contributes 2,108,492 rows with a usable TX centre frequency and recognized province or territory. At 3,550 MHz the table allocates 3,500–3,650 MHz to fixed and mobile services with a stated aeronautical exception. For the entire band, the initial edition counts 23,888 BC records at 1,221 distinct coordinate pairs and 3,734 Nova Scotia records at 384 pairs. The application shows the current edition for both sources.

Rows are placed by TX centre, including each band’s lower bound and excluding its upper. One site may publish multiple rows for technology, sector or frequency. Coordinate pairs are counted once within each province and band using the published positions. Missing or implausible coordinates do not contribute to that count. The Canadian allocation table covers services beyond this specific terrestrial licence file. A zero is a count in this extract. Spectrum utilization, interference, radio coverage and actual operation require different measurements. Consult ISED’s footnotes and authorization conditions for the specific service.

## Sources and updates

[Canadian Table of Frequency Allocations](https://ised-isde.canada.ca/site/spectrum-management-telecommunications/en/spectrum-allocation/canadian-table-frequency-allocations-sf10759) · [ISED terrestrial licence site file and field definitions](https://ised-isde.canada.ca/site/spectrum-management-system/en/spectrum-management-system-data/download-sms-data). Contains information licensed under the [Open Government Licence – Canada](https://open.canada.ca/en/open-government-licence-canada).

The monthly import discovers ISED’s published allocation JSON and streams its terrestrial ZIP. Only aggregate counts reach the browser. The status file records malformed and unclassifiable row totals. To reuse a downloaded source archive, pass `--sites /path/to/Site_Data_Extract_FX.zip` to the importer.

## Development

Run `python scripts/refresh.py` to retrieve public data, `node --test tests/*.test.mjs` and `python -m unittest discover -s tests` to test, and `python scripts/build.py` to build offline. Serve `dist/` over HTTP. GitHub Actions exercises the main user interaction on Chromium before publishing to Pages. A scheduled import that fails validation does not replace the published edition.
