import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to determine base URL safely
const getReqBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

// ==========================================
// LINKEDIN PUBLISHING
// ==========================================
app.post('/api/publish/linkedin', async (req, res) => {
  const { contentBody, publishMode } = req.body;
  
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

  if (!token || !authorUrn) {
    return res.status(200).json({
      destination: 'linkedin',
      status: 'not_configured',
      errorMessage: 'LinkedIn API credentials (LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN) are missing in the server environment.',
    });
  }

  // Real API call logic
  try {
    // For Drafts, we might not want to actually post. LinkedIn doesn't have a "draft" state via API easily.
    // If publishMode === 'draft', we just simulate success if configured, or post privately. 
    // The prompt says "Do not fake posting success". If it's a draft, we can skip the real API or return 'not_configured' for drafts.
    // Actually, "draft for Draft/Test" is for WordPress. For LinkedIn, we can just say "LinkedIn doesn't support API drafts" or post with visibility: CONNECTIONS.
    // Let's just post it with appropriate visibility.
    
    if (publishMode === 'draft') {
       return res.status(200).json({
         destination: 'linkedin',
         status: 'failed',
         errorMessage: 'LinkedIn API does not support draft mode posting. Please select Publish Now.'
       });
    }

    const payload = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: contentBody },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(200).json({
        destination: 'linkedin',
        status: 'failed',
        errorMessage: `LinkedIn API error: ${response.status} ${errText}`
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      destination: 'linkedin',
      status: 'published',
      externalId: data.id,
      externalUrl: `https://www.linkedin.com/feed/update/${data.id}`,
      publishedAt: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({
      destination: 'linkedin',
      status: 'failed',
      errorMessage: `Server error: ${error.message}`
    });
  }
});

// ==========================================
// WORDPRESS PUBLISHING
// ==========================================
app.post('/api/publish/wordpress', async (req, res) => {
  const { contentBody, publishMode } = req.body;
  
  const wpBaseUrl = process.env.WORDPRESS_BASE_URL;
  const wpUsername = process.env.WORDPRESS_USERNAME;
  const wpPassword = process.env.WORDPRESS_APP_PASSWORD;

  if (!wpBaseUrl || !wpUsername || !wpPassword) {
    return res.status(200).json({
      destination: 'wordpress',
      status: 'not_configured',
      errorMessage: 'WordPress API credentials (WORDPRESS_BASE_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD) are missing in the server environment.',
    });
  }

  try {
    const wpStatus = publishMode === 'publish_now' ? 'publish' : 'draft';
    const authHeader = 'Basic ' + Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    
    // As per instruction: title can be "CV Pro — AI CV Platform for Life"
    const payload = {
      title: 'CV Pro — AI CV Platform for Life',
      content: contentBody,
      status: wpStatus
    };

    const wpEndpoint = wpBaseUrl.replace(/\/$/, '') + '/wp-json/wp/v2/posts';
    
    const response = await fetch(wpEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(200).json({
        destination: 'wordpress',
        status: 'failed',
        errorMessage: `WordPress API error: ${response.status} ${errText}`
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      destination: 'wordpress',
      status: wpStatus === 'publish' ? 'published' : 'ready', // 'ready' implies draft is ready
      externalId: String(data.id),
      externalUrl: data.link,
      publishedAt: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({
      destination: 'wordpress',
      status: 'failed',
      errorMessage: `Server error: ${error.message}`
    });
  }
});

// ==========================================
// X / TWITTER PUBLISHING
// ==========================================
app.post('/api/publish/x', async (req, res) => {
  const { contentBody, publishMode } = req.body;
  
  // X OAuth 2.0 or 1.0a is normally required to post tweets. 
  // Let's assume a Bearer token or appropriate tokens exist.
  // Actually, standard V2 posting requires user context (OAuth 1.0a or OAuth 2.0 user context).
  const bearerToken = process.env.X_BEARER_TOKEN;

  if (!bearerToken) {
    return res.status(200).json({
      destination: 'x',
      status: 'not_configured',
      errorMessage: 'X API credentials (X_BEARER_TOKEN) are missing in the server environment.',
    });
  }

  try {
    if (publishMode === 'draft') {
      return res.status(200).json({
        destination: 'x',
        status: 'failed',
        errorMessage: 'X API does not support draft mode. Please select Publish Now.'
      });
    }

    const payload = {
      text: contentBody
    };

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(200).json({
        destination: 'x',
        status: 'failed',
        errorMessage: `X API error: ${response.status} ${errText}`
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      destination: 'x',
      status: 'published',
      externalId: data.data.id,
      externalUrl: `https://x.com/user/status/${data.data.id}`,
      publishedAt: new Date().toISOString()
    });

  } catch (error) {
    return res.status(200).json({
      destination: 'x',
      status: 'failed',
      errorMessage: `Server error: ${error.message}`
    });
  }
});

app.listen(port, () => {
  console.log(`DemandPilot backend listening on port ${port}`);
});
