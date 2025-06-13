import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Download, X, BarChart, Zap, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function AnalysisReport({ reportData, onClose, reportRef }) {
  const { toast } = useToast();

  const handleDownload = () => {
    const input = reportRef.current;
    if (!input) {
      toast({ title: 'Error de Descarga', description: 'No se pudo encontrar el reporte para descargar.', variant: 'destructive'});
      return;
    }

    toast({ title: 'Generando PDF...', description: 'Esto puede tardar un momento.' });

    html2canvas(input, {
        backgroundColor: '#1e293b', 
        scale: 2,
        useCORS: true, 
    }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('reporte-analisis-sonido.pdf');
        toast({ title: '¡Descarga Completa!', description: 'Tu reporte en PDF ha sido guardado.', className: "bg-green-600 border-green-700 text-white" });
    }).catch(err => {
        toast({ title: 'Error de Descarga', description: `Ocurrió un error: ${err.message}`, variant: 'destructive'});
    });
  };

  if (!reportData) return null;

  return (
    <div className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl border-2 border-teal-500/50" ref={reportRef}>
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-3xl font-bold neon-text-teal mb-2 flex items-center">
                    <FileText className="h-8 w-8 mr-3"/>Reporte de Análisis
                </h3>
                <p className="text-sm text-slate-300">Resumen de los datos más importantes de tu sonido.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-teal-300 flex-shrink-0 ml-4">
                <X className="h-6 w-6" />
            </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <motion.div
                initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.1, type:"spring"}}
                className="bg-green-700/25 rounded-lg p-5 text-center shadow-md border border-green-500/30"
            >
                <p className="text-green-300 text-sm font-semibold tracking-wider flex items-center justify-center"><Zap className="h-4 w-4 mr-2"/>FRECUENCIA PRINCIPAL</p>
                <p className="neon-text-green text-5xl font-bold my-1.5">{reportData.fundamentalFreq} <span className="text-3xl">Hz</span></p>
                <p className="text-xs text-green-400">La nota más dominante que encontramos.</p>
            </motion.div>
            
            <motion.div
                initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:0.2, type:"spring"}}
                className="bg-blue-700/25 rounded-lg p-5 shadow-md border border-blue-500/30"
            >
                <p className="text-blue-300 text-sm font-semibold tracking-wider flex items-center justify-center mb-2"><BarChart className="h-4 w-4 mr-2"/>ARMÓNICOS DETECTADOS</p>
                {reportData.harmonics && reportData.harmonics.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {reportData.harmonics.slice(0, 6).map((h, i) => (
                        <div key={i} className="bg-slate-700/50 rounded p-2 text-center">
                            <span className="text-blue-300 block font-bold">{h.order}° Arm.</span>
                            <span className="text-white text-sm">{h.frequency} Hz</span>
                        </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-sm py-4">No se detectaron armónicos claros.</p>
                )}
            </motion.div>
        </div>

        <motion.div
            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
            className="mt-8 text-center"
        >
            <Button onClick={handleDownload} className="button-teal py-3">
                <Download className="mr-2 h-5 w-5"/> Descargar Reporte en PDF
            </Button>
        </motion.div>
    </div>
  );
}