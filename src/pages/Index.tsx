import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Receipt {
  id: string;
  title: string;
  note: string;
  date: string;
  time: string;
}

export default function Index() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<'create' | 'history'>('create');
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('ru-RU');
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU');
  };

  const handlePrint = (receipt: Receipt) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Чек - ${receipt.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Roboto Mono', monospace;
              padding: 20mm;
              background: white;
            }
            
            .receipt {
              max-width: 80mm;
              margin: 0 auto;
              border: 2px dashed #000;
              padding: 10mm;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 5mm;
              margin-bottom: 5mm;
            }
            
            .header h1 {
              font-size: 18pt;
              font-weight: 700;
              margin-bottom: 3mm;
              text-transform: uppercase;
            }
            
            .info {
              margin-bottom: 5mm;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2mm;
              font-size: 10pt;
            }
            
            .content {
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 5mm 0;
              margin: 5mm 0;
            }
            
            .content h2 {
              font-size: 12pt;
              margin-bottom: 3mm;
              font-weight: 700;
            }
            
            .content p {
              font-size: 10pt;
              line-height: 1.5;
              white-space: pre-wrap;
            }
            
            .footer {
              text-align: center;
              font-size: 9pt;
              margin-top: 5mm;
            }
            
            @media print {
              body {
                padding: 0;
              }
              .receipt {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>📋 ЧЕК</h1>
            </div>
            
            <div class="info">
              <div class="info-row">
                <span>ДАТА:</span>
                <span>${receipt.date}</span>
              </div>
              <div class="info-row">
                <span>ВРЕМЯ:</span>
                <span>${receipt.time}</span>
              </div>
              <div class="info-row">
                <span>№:</span>
                <span>${receipt.id.toUpperCase()}</span>
              </div>
            </div>
            
            <div class="content">
              <h2>${receipt.title}</h2>
              <p>${receipt.note}</p>
            </div>
            
            <div class="footer">
              ════════════════════<br>
              СПАСИБО!<br>
              ════════════════════
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название чека',
        variant: 'destructive',
      });
      return;
    }

    if (editingId) {
      const updatedReceipts = receipts.map((r) =>
        r.id === editingId
          ? { ...r, title, note }
          : r
      );
      setReceipts(updatedReceipts);
      const updatedReceipt = updatedReceipts.find((r) => r.id === editingId);
      if (updatedReceipt) {
        handlePrint(updatedReceipt);
      }
      setEditingId(null);
      toast({
        title: 'Готово!',
        description: 'Чек обновлён и отправлен на печать',
      });
    } else {
      const newReceipt: Receipt = {
        id: generateId(),
        title,
        note,
        date: formatDate(),
        time: formatTime(),
      };
      setReceipts([newReceipt, ...receipts]);
      handlePrint(newReceipt);
      toast({
        title: 'Чек создан!',
        description: 'Отправлено на печать',
      });
    }

    setTitle('');
    setNote('');
  };

  const handleEdit = (receipt: Receipt) => {
    setTitle(receipt.title);
    setNote(receipt.note);
    setEditingId(receipt.id);
    setView('create');
  };

  const handleDelete = (id: string) => {
    setReceipts(receipts.filter((r) => r.id !== id));
    toast({
      title: 'Удалено',
      description: 'Чек удалён из истории',
    });
  };

  const handleCancel = () => {
    setTitle('');
    setNote('');
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Roboto Mono, monospace' }}>
            📋 Печать Чеков
          </h1>
          <p className="text-slate-400">Быстрое создание и печать чеков</p>
        </div>

        <div className="flex gap-4 mb-8 justify-center">
          <Button
            onClick={() => setView('create')}
            variant={view === 'create' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Icon name="Plus" size={18} />
            Создать чек
          </Button>
          <Button
            onClick={() => setView('history')}
            variant={view === 'history' ? 'default' : 'outline'}
            className="gap-2"
          >
            <Icon name="History" size={18} />
            История ({receipts.length})
          </Button>
        </div>

        {view === 'create' && (
          <Card className="p-8 bg-slate-800/50 border-slate-700 animate-scale-in backdrop-blur-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                  Название чека *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите название..."
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  style={{ fontFamily: 'Roboto Mono, monospace' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                  Примечание
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Дополнительная информация..."
                  rows={6}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                  style={{ fontFamily: 'Roboto Mono, monospace' }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Icon name="Printer" size={18} />
                  {editingId ? 'Обновить и напечатать' : 'Создать и напечатать'}
                </Button>
                {editingId && (
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="lg"
                  >
                    Отмена
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {view === 'history' && (
          <div className="space-y-4 animate-fade-in">
            {receipts.length === 0 ? (
              <Card className="p-12 bg-slate-800/50 border-slate-700 text-center backdrop-blur-sm">
                <Icon name="FileText" size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">История чеков пуста</p>
                <Button
                  onClick={() => setView('create')}
                  variant="outline"
                  className="mt-4"
                >
                  Создать первый чек
                </Button>
              </Card>
            ) : (
              receipts.map((receipt) => (
                <Card
                  key={receipt.id}
                  className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all animate-scale-in backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ fontFamily: 'Roboto Mono, monospace' }}
                      >
                        {receipt.title}
                      </h3>
                      <p className="text-slate-400 mb-3 whitespace-pre-wrap">
                        {receipt.note}
                      </p>
                      <div className="flex gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          {receipt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          {receipt.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Hash" size={14} />
                          {receipt.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handlePrint(receipt)}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <Icon name="Printer" size={16} />
                        Печать
                      </Button>
                      <Button
                        onClick={() => handleEdit(receipt)}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(receipt.id)}
                        size="sm"
                        variant="outline"
                        className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
