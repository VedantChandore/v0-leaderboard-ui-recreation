import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileUrl = searchParams.get('url');
    
    if (!profileUrl) {
      return NextResponse.json({ error: 'Profile URL is required' }, { status: 400 });
    }

    // Validate the URL is from Google Cloud Skills Boost (support both old and new domains)
    const isValidDomain = profileUrl.includes('cloudskillsboost.google') || profileUrl.includes('skills.google');
    if (!isValidDomain || !profileUrl.includes('/public_profiles/')) {
      return NextResponse.json({ error: 'Invalid Google Cloud Skills Boost profile URL' }, { status: 400 });
    }

    // Fetch the profile page
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: response.status });
    }

    const htmlContent = await response.text();
    
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in proxy-profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
