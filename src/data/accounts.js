export const ACCOUNT_CATEGORIES = {
  assets: {
    label: '資産',
    accounts: ['現金', '普通預金', '定期預金', '受取手形', '売掛金', '商品', '建物', '備品']
  },
  liabilities: {
    label: '負債',
    accounts: ['支払手形', '買掛金', '借入金', '未払金']
  },
  equity: {
    label: '純資産',
    accounts: ['資本金', '引出金']
  },
  revenue: {
    label: '収益',
    accounts: ['売上', '受取利息', '受取手数料']
  },
  expense: {
    label: '費用',
    accounts: ['仕入', '給料', '水道光熱費', '通信費', '支払利息', '支払手数料']
  }
};

export const getAllAccounts = () => {
  const all = [];
  Object.values(ACCOUNT_CATEGORIES).forEach(cat => {
    all.push(...cat.accounts);
  });
  return all;
};
