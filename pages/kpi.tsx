import React, { useState } from 'react';
import * as R from 'ramda';

import { Grid, withStyles, WithStyles } from '@material-ui/core';

import Layout from '~/components/Layout';
import MaterialTable from 'material-table';
import { useQuery } from '@apollo/react-hooks';
import { MonthlyInvestorCountQuery, MonthlyInvestmentCountQuery, MonthlyAumQuery } from '~/queries/MonthlyQuery';
import { formatBigNumber } from '~/utils/formatBigNumber';
import BigNumber from 'bignumber.js';

interface MonthlyQuantity {
  value: number;
  change: number;
}

interface AnnualQuantityList {
  quantity: string;
  m1: MonthlyQuantity;
  m2: MonthlyQuantity;
  m3: MonthlyQuantity;
  m4: MonthlyQuantity;
  m5: MonthlyQuantity;
  m6: MonthlyQuantity;
  m7: MonthlyQuantity;
  m8: MonthlyQuantity;
  m9: MonthlyQuantity;
  m10: MonthlyQuantity;
  m11: MonthlyQuantity;
  m12: MonthlyQuantity;
}

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(2),
  },
});

type KPIProps = WithStyles<typeof styles>;

const startOfMonth = (month: number, year: number) => new Date(year, month, 1).getTime() / 1000;

const renderCell = (rowData, key) => {
  if (!rowData[key].value || isNaN(rowData[key].value)) {
    return <></>;
  }

  return (
    <>
      {rowData[key].value} {!isNaN(rowData[key].change) && `(${rowData[key].change})`}
    </>
  );
};
const KPI: React.FunctionComponent<KPIProps> = () => {
  const currentYear = new Date().getUTCFullYear();
  const [year, setYear] = useState(currentYear);

  const timestamps = R.range(0, 13).map((r) => startOfMonth(r, year));
  const queryVariables = timestamps.reduce((acc, item, index) => ({ ...acc, ['d' + index]: item }), {});

  // investors
  const investorResult = useQuery(MonthlyInvestorCountQuery, {
    ssr: false,
    variables: queryVariables,
  });
  const investorData = investorResult?.data;
  const investorMonthly = R.range(1, 13)
    .map((r) => ({
      value: investorData?.[`m${r}`]?.[0]?.active,
      change:
        investorData?.[`m${r}`]?.[0]?.active -
        (!isNaN(investorData?.[`m${r - 1}`]?.[0]?.active) ? investorData?.[`m${r - 1}`]?.[0]?.active : 0),
    }))
    .reduce((acc, item, index) => ({ ...acc, [`m${index + 1}`]: item }), {});

  // investments
  const investmentResult = useQuery(MonthlyInvestmentCountQuery, {
    ssr: false,
    variables: queryVariables,
  });
  const investmentData = investmentResult?.data;
  const investmentMonthly = R.range(1, 13)
    .map((r) => ({
      value: investmentData?.[`m${r}`]?.[0]?.active,
      change:
        investmentData?.[`m${r}`]?.[0]?.active -
        (!isNaN(investmentData?.[`m${r - 1}`]?.[0]?.active) ? investmentData?.[`m${r - 1}`]?.[0]?.active : 0),
    }))
    .reduce((acc, item, index) => ({ ...acc, [`m${index + 1}`]: item }), {});

  // AUM
  const aumResult = useQuery(MonthlyAumQuery, {
    ssr: false,
    variables: queryVariables,
  });
  const aumData = aumResult?.data;
  const aumMonthly = R.range(1, 13)
    .map((r) => ({
      value: formatBigNumber(aumData?.[`m${r}`]?.[0]?.gav, 18, 0),
      change: new BigNumber(aumData?.[`m${r}`]?.[0]?.gav)
        .minus(new BigNumber(aumData?.[`m${r - 1}`]?.[0]?.gav || 0))
        .dividedBy('1e18')
        .integerValue(),
    }))
    .reduce((acc, item, index) => ({ ...acc, [`m${index + 1}`]: item }), {});

  const list = [
    {
      quantity: 'Investors',
      ...investorMonthly,
    },
    { quantity: 'Investments', ...investmentMonthly },
    { quantity: 'AUM', ...aumMonthly },
  ] as AnnualQuantityList[];

  return (
    <Layout title="Monthly key numbers" page="monthly">
      <Grid item={true} xs={12} sm={12} md={12}>
        <MaterialTable
          columns={[
            {
              title: 'Quantity',
              field: 'quantity',
              cellStyle: {
                whiteSpace: 'nowrap',
              },
              headerStyle: {
                whiteSpace: 'nowrap',
              },
            },
            {
              title: 'Jan',
              render: (rowData) => renderCell(rowData, 'm1'),
            },
            {
              title: 'Feb',
              render: (rowData) => renderCell(rowData, 'm2'),
            },
            {
              title: 'Mar',
              render: (rowData) => renderCell(rowData, 'm3'),
            },
            {
              title: 'Apr',
              render: (rowData) => renderCell(rowData, 'm4'),
            },
            {
              title: 'May',
              render: (rowData) => renderCell(rowData, 'm5'),
            },
            {
              title: 'Jun',
              render: (rowData) => renderCell(rowData, 'm6'),
            },
            {
              title: 'Jul',
              render: (rowData) => renderCell(rowData, 'm7'),
            },
            {
              title: 'Aug',
              render: (rowData) => renderCell(rowData, 'm8'),
            },
            {
              title: 'Sep',
              render: (rowData) => renderCell(rowData, 'm9'),
            },
            {
              title: 'Oct',
              render: (rowData) => renderCell(rowData, 'm10'),
            },
            {
              title: 'Nov',
              render: (rowData) => renderCell(rowData, 'm11'),
            },
            {
              title: 'Dec',
              render: (rowData) => renderCell(rowData, 'm12'),
            },
          ]}
          data={list}
          title={`Monthly key numbers for ${year}`}
          options={{
            paging: false,
            search: false,
            doubleHorizontalScroll: true,
          }}
          isLoading={investorResult.loading}
          onRowClick={(_, rowData: any) => {
            const url = '/investor?address=' + rowData.owner.id;
            window.open(url, '_self');
          }}
        />
        <button onClick={() => setYear(year - 1)} disabled={year === 2019}>
          Previous year
        </button>
        <button onClick={() => setYear(year + 1)} disabled={year === currentYear}>
          Next year
        </button>
      </Grid>
    </Layout>
  );
};

export default withStyles(styles)(KPI);
