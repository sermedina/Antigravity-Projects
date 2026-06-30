import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

interface Column {
  id: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading: boolean;
  totalRows?: number;
  page?: number;
  limit?: number;
  onPageChange?: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
}

export default function DataTable({
  columns,
  data,
  loading,
  totalRows = 0,
  page = 0,
  limit = 10,
  onPageChange,
  onLimitChange,
}: DataTableProps) {
  const handleChangePage = (_: any, newPage: number) => {
    if (onPageChange) onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onLimitChange) onLimitChange(parseInt(event.target.value, 10));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        bgcolor: '#1e293b',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
      }}
    >
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    bgcolor: '#0f172a',
                    color: 'grey.300',
                    fontWeight: 700,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <CircularProgress color="primary" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography color="grey.400" sx={{ fontWeight: 600 }}>
                    No se encontraron registros.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  hover
                  key={row.id || index}
                  sx={{
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02) !important' },
                    '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: 'grey.200' },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.render ? column.render(row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRows}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Registros por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{
            color: 'grey.400',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            '& .MuiTablePagination-selectIcon': { color: 'grey.400' },
          }}
        />
      )}
    </Paper>
  );
}
