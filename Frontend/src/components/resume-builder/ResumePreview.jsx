import ModernTemplate from "../../assets/templates/ModernTemplate";
import MinimalImageTemplate from "../../assets/templates/MinimalImageTemplate";
import MinimalTemplate from "../../assets/templates/MinimalTemplate";
import ClassicTemplate from "../../assets/templates/ClassicTemplate";
import MinimalistTemplate from "../../assets/templates/MinimalistTemplate";
import CreativeVisualTemplate from "../../assets/templates/CreativeVisualTemplate";
import CorporateATSTemplate from "../../assets/templates/CorporateATSTemplate";
import ModernProTemplate from "../../assets/templates/ModernProTemplate";

const ResumePreview = (props) => {
  const { data, template, accentColor, classes = "" } = props;

  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data} accentColor={accentColor} />;
      case "minimal-image":
        return <MinimalImageTemplate data={data} accentColor={accentColor} />;
      case "minimal":
        return <MinimalTemplate data={data} accentColor={accentColor} />;
      case "minimalist":
        return <MinimalistTemplate data={data} accentColor={accentColor} />;
      case "creativeVisual":
        return <CreativeVisualTemplate data={data} accentColor={accentColor} />;
      case "corporateATSTemplate":
        return <CorporateATSTemplate data={data} accentColor={accentColor} />;
      case "modernProTemplate":
        return <ModernProTemplate data={data} accentColor={accentColor} />;
      default:
        return <ClassicTemplate data={data} accentColor={accentColor} />;
    }
  };

  return (
    <div className="w-full">
      <div
        id="resume-preview"
        className={
          "border border-white/10 print:shadow-none print:border-none " + classes
        }
      >
        {renderTemplate()}
      </div>

      <style>
        {`
          /* OVERLEAF A4 SIMULATION */
          #resume-preview > div {
            min-height: 297mm;
            padding: 15mm 15mm; /* Standard Overleaf margin inside the colored background */
            box-sizing: border-box;
            background: white;
            position: relative;
          }

          @page {
            size: A4 z;
            margin: 0;
          }

          @media print {
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden;
            }
            #resume-preview, #resume-preview * {
              visibility: visible;
            }
            #resume-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
            }
            
            /* If content exceeds 1 page, Chrome automatically handles page breaks, 
               but the container is guaranteed to extend bounds cleanly */
          }
        `}
      </style>
    </div>
  );
};

export default ResumePreview;
