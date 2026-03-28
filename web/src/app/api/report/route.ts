import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/dbConnect'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const evidence = formData.get('evidence') as File
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const description = formData.get('description') as string
    const category = formData.get('category') as string | null
    const userId = formData.get('userId') as string | null

    if (!evidence || isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const bucketName = 'reports'
    const fileName = `${Date.now()}-${evidence.name.replace(/\s/g, '-')}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, evidence, {
        contentType: evidence.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload evidence' }, { status: 500 })
    }

    const { data: storageData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    const publicUrl = storageData.publicUrl

    // Save report in database with "Pending AI" status
    const { data: report, error: reportError } = await supabaseAdmin
      .from('citizen_reports')
      .insert({
        image_url: publicUrl,
        latitude,
        longitude,
        notes: description,
        category: category || 'Other',
        user_id: userId || null,
        status: 'Pending AI' // Set initial status
      })
      .select()
      .single()

    if (reportError) {
      console.error('Report insert error:', reportError)
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
    }

    // NON-BLOCKING AI CALL:
    // Hum background API ko trigger kar rahe hain par `await` nahi kar rahe.
    // Isse citizen ko turant success screen dikhegi, aur AI apna kaam piche karega.
    const protocol = req.headers.get('x-forwarded-proto') || 'http'
    const host = req.headers.get('host')
    const aiProcessUrl = `${protocol}://${host}/api/report/process`

    fetch(aiProcessUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: report.id, notes: description })
    }).catch(err => console.error("Background AI trigger failed:", err));

    return NextResponse.json({
      success: true,
      report,
      message: "Report saved. AI verification is processing in the background."
    })

  } catch (err) {
    console.error('Report API Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}