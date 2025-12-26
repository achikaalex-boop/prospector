import axios from 'axios'

const payload = {
  name: 'Test Batch from local',
  from_number: '+14752906147',
  tasks: [
    {
      to_number: '+2290190331335',
      ignore_e164_validation: false,
      retell_llm_dynamic_variables: {
        agent_name: 'Sophie',
        company_name: 'TechCorp Solutions',
        domain: 'Intelligence Artificielle',
        objectifs: 'Qualification de prospects',
        promesse_de_valeur: "Augmenter votre productivité de 40% avec notre IA",
        infos: 'Prospect intéressé par automation',
        contact_first_name: 'Jean',
        referal_name: 'Marie Dupont',
        key_capability: 'Automatisation intelligente des tâches répétitives',
        call_script_example: 'Bonjour Jean, je suis Sophie de TechCorp Solutions...',
        pain_point_identifie: 'Perte de temps sur les tâches manuelles',
        campaign_id: 'test-campaign-123'
      }
    },
    {
      to_number: '+22997654321',
      ignore_e164_validation: false,
      retell_llm_dynamic_variables: {
        agent_name: 'Sophie',
        company_name: 'TechCorp Solutions',
        domain: 'Intelligence Artificielle',
        objectifs: 'Relance suite à webinar',
        promesse_de_valeur: 'Réduire vos coûts opérationnels de 30%',
        infos: 'A participé au webinar la semaine dernière',
        contact_first_name: 'Aminata',
        referal_name: 'Thomas Martin',
        key_capability: 'Support client automatisé 24/7',
        call_script_example: 'Bonjour Aminata, je suis Sophie de TechCorp Solutions...',
        pain_point_identifie: 'Surcharge du service client',
        campaign_id: 'test-campaign-123'
      }
    }
  ],
  send_now: true,
  trigger_timestamp: Date.now(),
  reserved_concurrency: 1,
  call_time_window: {
    windows: [{ start: 0, end: 1440 }],
    timezone: 'America/Los_Angeles'
  }
}

async function waitForServerAndPost() {
  const url = 'http://localhost:8080/create-batch'
  for (let i = 0; i < 6; i++) {
    try {
      console.log(`Attempt ${i+1}: sending payload to ${url} ...`)
      const resp = await axios.post(url, payload, { timeout: 5000 })
      console.log('Response status:', resp.status)
      console.log('Response data:', resp.data)
      return
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
        console.log('Server not ready, retrying in 1s...')
        await new Promise(r => setTimeout(r, 1000))
        continue
      }
      if (err.response) {
        console.log('HTTP error from server:', err.response.status, err.response.data)
        return
      }
      console.error('Unexpected error:', err.message)
      return
    }
  }
  console.error('Server did not respond after retries')
}

waitForServerAndPost()
