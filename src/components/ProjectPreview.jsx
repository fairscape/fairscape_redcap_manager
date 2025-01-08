import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Database } from 'lucide-react';

const MetadataPreview = ({ project }) => {
  const [jsonLdData, setJsonLdData] = useState(null);
  
  useEffect(() => {
    if (project?.formData) {
      // Transform project data into JSON-LD format
      const jsonLd = {
        "@context": {
          "@vocab": "http://schema.org/",
          "rc": "https://redcap.org/terms#",
          "fairscape": "https://fairscape.org/terms#"
        },
        "@type": "Dataset",
        "@id": `fairscape:project-${project.id}`,
        "name": project.name,
        "url": project.url,
        "dateCreated": new Date().toISOString(),
        "creator": {
          "@type": "Organization",
          "name": "REDCap"
        },
        "hasPart": project.formData.map(form => ({
          "@type": "rc:Form",
          "name": form.form_name,
          "fields": form.fields.map(field => ({
            "@type": "rc:Field",
            "name": field.field_name,
            "fieldType": field.field_type,
            "label": field.field_label,
            "required": field.required,
            "phi": field.phi === 'y'
          }))
        }))
      };
      setJsonLdData(jsonLd);
    }
  }, [project]);

  const renderROCrate = () => {
    if (!project?.formData) return null;

    const formFiles = project.formData.map(form => ({
      name: `${form.form_name}.csv`,
      type: 'data',
      fields: form.fields.length
    }));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {formFiles.map((file, index) => (
            <div key={index} className="flex items-center p-4 border rounded-lg bg-white">
              <FileText className="w-6 h-6 mr-3 text-blue-500" />
              <div className="flex-grow">
                <h4 className="font-medium">{file.name}</h4>
                <p className="text-sm text-gray-500">
                  {file.fields} fields • {file.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!project) {
    return (
      <Alert>
        <AlertDescription>
          Please select a project to view metadata
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Project Metadata Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="json-ld" className="w-full">
          <TabsList>
            <TabsTrigger value="json-ld">JSON-LD</TabsTrigger>
            <TabsTrigger value="ro-crate">RO-Crate Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="json-ld">
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm">
                {JSON.stringify(jsonLdData, null, 2)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="ro-crate">
            {renderROCrate()}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default MetadataPreview;