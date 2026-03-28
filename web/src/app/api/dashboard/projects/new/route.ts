import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/dbConnect'; // Ensure path is correct

const generateProjectId = () => `PRJ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

const uploadProjectReport = async (projectId: string, file: File) => {
  const safeName = file.name.replace(/\s+/g, '-');
  const filePath = `${projectId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('project_reports')
    .upload(filePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabaseAdmin.storage.from('project_reports').getPublicUrl(filePath);
  return data.publicUrl;
};

export async function POST(req: NextRequest) {
  try {
    const isMultipart = (req.headers.get('content-type') || '').includes('multipart/form-data');

    let id = '';
    let projectName = '';
    let category = '';
    let budget: number | string | null = null;
    let deadline: string | null = null;
    let status: string | null = null;
    let latitude: number | string | null = null;
    let longitude: number | string | null = null;
    let description: string | null = null;
    let department: string | null = null;
    let vendor_id: number | string | null = null;
    let report: string | null = null;

    if (isMultipart) {
      const formData = await req.formData();
      id = String(formData.get('id') || '').trim();
      if (!id) id = generateProjectId();
      projectName = String(formData.get('project_name') || formData.get('projectName') || '').trim();
      category = String(formData.get('category') || '').trim();
      budget = formData.get('budget') as string | null;
      deadline = (formData.get('deadline') as string) || null;
      status = (formData.get('status') as string) || null;
      latitude = formData.get('latitude') as string | null;
      longitude = formData.get('longitude') as string | null;
      description = (formData.get('description') as string) || null;
      department = (formData.get('department') as string) || null;
      vendor_id = formData.get('vendor_id') as string | null;
      report = (formData.get('report') as string) || null;

      const reportFile = formData.get('report_file');
      if (reportFile instanceof File && reportFile.size > 0) {
        report = await uploadProjectReport(id, reportFile);
      }
    } else {
      const body = await req.json();
      id = String(body.id || '').trim();
      if (!id) id = generateProjectId();
      projectName = body.project_name || body.projectName;
      category = body.category;
      budget = body.budget;
      deadline = body.deadline;
      status = body.status;
      latitude = body.latitude;
      longitude = body.longitude;
      description = body.description;
      department = body.department;
      vendor_id = body.vendor_id;
      report = body.report;
    }

    const normalizedProjectName = String(projectName || '').trim();

    if (!normalizedProjectName || !category || budget === undefined || budget === null || budget === "") {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        id,
        project_name: normalizedProjectName,
        category,
        budget: Number(budget),
        deadline: deadline || null,
        status: status || 'Planned',
        latitude: latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null,
        longitude: longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null,
        description: description || null,
        department: department || null,
        vendor_id: vendor_id !== undefined && vendor_id !== null && vendor_id !== '' ? Number(vendor_id) : null,
        report: report || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: data });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}