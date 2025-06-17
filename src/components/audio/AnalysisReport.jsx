import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Download, X, BarChart, Zap, TrendingUp, Music, Speaker, Rss, Layers, ListMusic as FileMusic, BarChart3 as BarChartIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StatCard = ({ icon, label, value, unit, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 + 0.1, type: "spring", stiffness: 150 }}
        className={`bg-${color}-700/25 rounded-lg p-4 shadow-md border border-${color}-500/30 text-center`}
    >
        <div className={`mx-auto mb-2 h-10 w-10 rounded-full bg-${color}-600/30 flex items-center justify-center text-${color}-300`}>
            {icon}
        </div>
        <p className={`text-${color}-300 text-xs font-semibold tracking-wider uppercase`}>{label}</p>
        <p className={`neon-text-${color} text-3xl font-bold my-0.5`}>
            {value !== null && typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 2) : (value || "N/A")}
            {unit && <span className="text-xl ml-1">{unit}</span>}
        </p>
    </motion.div>
);


export function AnalysisReport({ reportData, onClose, reportRef, chartRefs }) {
  const { toast } = useToast();

  const handleDownload = async () => {
    const input = reportRef.current;
    if (!input) {
      toast({ title: 'Error de Descarga', description: 'No se pudo encontrar el reporte para descargar.', variant: 'destructive'});
      return;
    }

    toast({ title: 'Generando PDF...', description: 'Esto puede tardar un momento.' });
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    let yPos = margin;

    const addCanvasToPdf = async (canvasElement, title) => {
        if (!canvasElement) return;
        try {
            const canvas = await html2canvas(canvasElement, { 
                backgroundColor: '#1e293b', // canvas-bg-dark equivalent
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png', 1.0);
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth - 2 * margin;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            if (yPos + imgHeight + 10 > pdfHeight - margin) { // Check if new page needed (+10 for title)
                pdf.addPage();
                yPos = margin;
            }
            
            pdf.setFontSize(12);
            pdf.setTextColor(150, 150, 150);
            pdf.text(title, margin, yPos);
            yPos += 5;

            pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 5; // Add some padding after image
        } catch (error) {
            console.error("Error adding canvas to PDF:", error);
            toast({ title: 'Error en Gráfico', description: `No se pudo añadir "${title}" al PDF.`, variant: 'destructive'});
        }
    };
    
    const mainContentElement = input.cloneNode(true);
    mainContentElement.querySelectorAll('.visualization-for-pdf').forEach(el => el.remove());
    mainContentElement.style.backgroundColor = '#0f172a';
    mainContentElement.style.padding = '10px';
    document.body.appendChild(mainContentElement);


    try {
        const mainCanvas = await html2canvas(mainContentElement, {
            backgroundColor: '#0f172a',
            scale: 1.5,
            useCORS: true,
            windowWidth: mainContentElement.scrollWidth,
            windowHeight: mainContentElement.scrollHeight,
            ignoreElements: (element) => element.classList.contains('no-print') || element.closest('.visualization-for-pdf'),
        });
        document.body.removeChild(mainContentElement);

        const mainImgData = mainCanvas.toDataURL('image/png', 0.95);
        const mainImgProps = pdf.getImageProperties(mainImgData);
        const mainImgWidth = pdfWidth - 2 * margin;
        const mainImgHeight = (mainImgProps.height * mainImgWidth) / mainImgProps.width;
        
        pdf.addImage(mainImgData, 'PNG', margin, yPos, mainImgWidth, mainImgHeight);
        yPos += mainImgHeight + 5;

        if (chartRefs) {
            if (chartRefs.spectrogram?.current) await addCanvasToPdf(chartRefs.spectrogram.current, "Espectrograma");
            if (chartRefs.generalStaff?.current) await addCanvasToPdf(chartRefs.generalStaff.current, "Partitura General");
            if (chartRefs.harmonic?.current) await addCanvasToPdf(chartRefs.harmonic.current, "Análisis de Armónicos");
        }

        pdf.save('reporte-analisis-sonido-pro.pdf');
        toast({ title: '¡Descarga Completa!', description: 'Tu reporte PRO en PDF ha sido guardado.', className: "bg-green-600 border-green-700 text-white" });

    } catch (err) {
        if (mainContentElement.parentElement) document.body.removeChild(mainContentElement);
        toast({ title: 'Error de Descarga', description: `Ocurrió un error: ${err.message}`, variant: 'destructive'});
    }
  };

  if (!reportData) return null;

  return (
    <div id="analysisReportContentOuter" className="glass-effect-dark p-6 md:p-8 rounded-2xl shadow-xl border-2 border-teal-500/50 bg-slate-900">
      <div ref={reportRef} id="analysisReportContentInner">
        <style>{`
            .neon-text-teal { text-shadow: 0 0 5px #2dd4bf, 0 0 10px #2dd4bf, 0 0 15px #2dd4bf; }
            .neon-text-green { text-shadow: 0 0 5px #34d399, 0 0 10px #34d399, 0 0 15px #34d399; }
            .neon-text-blue { text-shadow: 0 0 5px #60a5fa, 0 0 10px #60a5fa, 0 0 15px #60a5fa; }
            .neon-text-purple { text-shadow: 0 0 5px #a78bfa, 0 0 10px #a78bfa, 0 0 15px #a78bfa; }
            .neon-text-yellow { text-shadow: 0 0 5px #facc15, 0 0 10px #facc15, 0 0 15px #facc15; }
            .neon-text-orange { text-shadow: 0 0 5px #fb923c, 0 0 10px #fb923c, 0 0 15px #fb923c; }
            .chart-container-pdf { width: 100%; height: 200px; background-color: #1e293b; border-radius: 8px; padding: 10px; margin-bottom: 15px; }
        `}</style>
        <div className="flex justify-between items-start mb-8">
            <div>
                <h3 className="text-3xl font-bold neon-text-teal mb-2 flex items-center">
                    <FileText className="h-8 w-8 mr-3"/>Reporte Detallado del Sonido PRO
                </h3>
                <p className="text-sm text-slate-300">Un vistazo profundo a las características de tu audio con gráficos avanzados.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-teal-300 flex-shrink-0 ml-4 no-print">
                <X className="h-6 w-6" />
            </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={<Zap className="w-5 h-5"/>} label="Frec. Principal" value={reportData.fundamentalFreq} unit="Hz" color="green" delay={0} />
            <StatCard icon={<Music className="w-5 h-5"/>} label="Nota Estimada" value={reportData.estimatedNote} unit="" color="blue" delay={1} />
            <StatCard icon={<Speaker className="w-5 h-5"/>} label="Sonoridad (LUFS)" value={reportData.loudnessLUFS} unit="" color="purple" delay={2} />
            <StatCard icon={<Rss className="w-5 h-5"/>} label="Amplitud Pico" value={reportData.peakAmplitude} unit="dB" color="yellow" delay={3} />
        </div>
        
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="bg-slate-800/50 rounded-lg p-5 shadow-md border border-slate-700/50 mb-8"
        >
            <p className="text-slate-300 text-sm font-semibold tracking-wider flex items-center justify-center mb-3">
                <BarChartIcon className="h-5 w-5 mr-2 text-indigo-400"/>ARMÓNICOS DETECTADOS
            </p>
            {reportData.harmonics && reportData.harmonics.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
                    {reportData.harmonics.slice(0, 10).map((h, i) => (
                    <motion.div 
                        key={i} 
                        initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:0.6 + i*0.05, type:"spring"}}
                        className="bg-slate-700/60 rounded p-2.5 text-center"
                    >
                        <span className="text-indigo-300 block font-bold">{h.order}° Arm.</span>
                        <span className="text-white text-sm">{h.frequency} Hz</span>
                        <span className="text-slate-400 block text-xs">({h.amplitude.toFixed(0)} dB)</span>
                    </motion.div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-400 text-sm py-4">No se detectaron armónicos claros o la frecuencia fundamental es muy baja.</p>
            )}
        </motion.div>
        
        {/* Placeholders for PDF generation, actual charts are in AudioAnalyzer.jsx */}
        <div className="hidden visualization-for-pdf-placeholder" data-chart-id="spectrogram">Espectrograma (Captura de App)</div>
        <div className="hidden visualization-for-pdf-placeholder" data-chart-id="generalStaff">Partitura General (Captura de App)</div>
        <div className="hidden visualization-for-pdf-placeholder" data-chart-id="harmonic">Análisis de Armónicos (Captura de App)</div>
      </div>

      <motion.div
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}}
          className="mt-10 text-center no-print"
      >
          <Button onClick={handleDownload} className="button-teal py-3 px-8 text-base">
              <Download className="mr-2 h-5 w-5"/> Descargar Reporte en PDF
          </Button>
      </motion.div>
    </div>
  );
}