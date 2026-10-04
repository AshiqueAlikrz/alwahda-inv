// Who paid the VAT on a bill. Newer bills record this per line, so a bill can be mixed;
// older ones only have the single bill-level flag.
export const vatPaidByLabel = (invoice: any): string => {
  const flags = (invoice?.items ?? [])
    .map((item: any) => item?.vatPaidByCompany)
    .filter((flag: any) => typeof flag === 'boolean');
  if (flags.length > 0) {
    if (flags.every(Boolean)) return 'Company';
    if (!flags.some(Boolean)) return 'Customer';
    return 'Mixed';
  }
  if (invoice?.vatPaidByCompany === undefined) return '-';
  return invoice.vatPaidByCompany ? 'Company' : 'Customer';
};
