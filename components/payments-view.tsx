'use client'

import { useState } from 'react'
import { Payment, PaymentMethod } from '@/lib/types'
import { formatCurrency, formatDate, getPaymentMethodLabel, getPaymentMethodColor } from '@/lib/utils-format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { PaymentModal } from './payment-modal'

interface PaymentsViewProps {
  payments: Payment[]
  onAddPayment: (payment: Omit<Payment, 'id'>) => void
  onEditPayment: (payment: Payment) => void
  onDeletePayment: (id: string) => void
}

export function PaymentsView({ payments, onAddPayment, onEditPayment, onDeletePayment }: PaymentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredPayments = payments.filter(payment => 
    payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.patientCpf.includes(searchTerm)
  )

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPayment(null)
  }

  const handleSave = (data: { patientName: string; patientCpf: string; amount: number; method: PaymentMethod; date: string }) => {
    if (editingPayment) {
      onEditPayment({
        ...editingPayment,
        ...data
      })
    } else {
      onAddPayment({
        patientId: Date.now().toString(),
        ...data
      })
    }
    handleModalClose()
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <CardTitle className="text-zinc-800">Pacientes</CardTitle>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Pagamento
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-50 border-zinc-200 focus-visible:ring-primary"
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                  <TableHead className="font-semibold text-zinc-700">Paciente</TableHead>
                  <TableHead className="font-semibold text-zinc-700">CPF</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Valor Pago</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Método</TableHead>
                  <TableHead className="font-semibold text-zinc-700">Data</TableHead>
                  <TableHead className="font-semibold text-zinc-700 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-zinc-50 transition-colors">
                      <TableCell className="font-medium text-zinc-800">{payment.patientName}</TableCell>
                      <TableCell className="text-zinc-600 font-mono text-sm">{payment.patientCpf}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${getPaymentMethodColor(payment.method)} border-0 font-medium`}>
                          {getPaymentMethodLabel(payment.method)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-600">{formatDate(payment.date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(payment)}
                            className="h-8 w-8 text-zinc-500 hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(payment.id)}
                            className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        initialData={editingPayment}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDeletePayment(deleteId)
                setDeleteId(null)
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
