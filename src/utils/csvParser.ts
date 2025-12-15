import { Keyword, GMBRanking, DEFAULT_TRAFFIC_SHARES } from '../types';

export const parseKeywordsCSV = (csvText: string): Keyword[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const keywords: Keyword[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    
    const getIndex = (name: string) => {
      const index = headers.findIndex((h) => h.includes(name));
      return index >= 0 ? index : -1;
    };

    const keywordIndex = getIndex('keyword');
    const searchesIndex = getIndex('search');
    const competitionIndex = getIndex('competition');
    const cpcIndex = getIndex('cpc') >= 0 ? getIndex('cpc') : getIndex('bid');
    const stateIndex = getIndex('state');
    const cityIndex = getIndex('city');
    const avgJobIndex = getIndex('job') >= 0 ? getIndex('job') : getIndex('avg');

    if (keywordIndex >= 0 && searchesIndex >= 0) {
      const keyword: Keyword = {
        id: `kw-${Date.now()}-${i}`,
        state: stateIndex >= 0 ? values[stateIndex] : '',
        city: cityIndex >= 0 ? values[cityIndex] : '',
        keyword: values[keywordIndex],
        monthlySearches: parseInt(values[searchesIndex].replace(/,/g, '')) || 0,
        competition: competitionIndex >= 0 ? values[competitionIndex] : 'Unknown',
        cpc: cpcIndex >= 0 ? parseFloat(values[cpcIndex].replace(/[$,]/g, '')) || 0 : 0,
        avgJobSize: avgJobIndex >= 0 ? parseFloat(values[avgJobIndex].replace(/[$,]/g, '')) || 0 : 0,
      };
      keywords.push(keyword);
    }
  }

  return keywords;
};

export const parseRankingsCSV = (
  csvText: string,
  existingKeywords: Keyword[]
): GMBRanking[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rankings: GMBRanking[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    
    const getIndex = (name: string) => {
      const index = headers.findIndex((h) => h.includes(name));
      return index >= 0 ? index : -1;
    };

    const keywordIndex = getIndex('keyword');
    const rankIndex = getIndex('rank');
    const gmbNameIndex = getIndex('gmb') >= 0 ? getIndex('gmb') : getIndex('name');
    const trafficShareIndex = getIndex('traffic');
    const isMyBusinessIndex = getIndex('my') >= 0 ? getIndex('my') : getIndex('mine');

    if (keywordIndex >= 0 && rankIndex >= 0 && gmbNameIndex >= 0) {
      // Find matching keyword
      const keywordText = values[keywordIndex];
      const matchingKeyword = existingKeywords.find(
        (k) => k.keyword.toLowerCase() === keywordText.toLowerCase()
      );

      if (matchingKeyword) {
        const rank = parseInt(values[rankIndex]) || 0;
        let trafficShare = 0;

        if (trafficShareIndex >= 0 && values[trafficShareIndex]) {
          trafficShare = parseFloat(values[trafficShareIndex].replace(/%/g, '')) || 0;
        } else {
          trafficShare = DEFAULT_TRAFFIC_SHARES[rank] || 0;
        }

        const isMyBusiness = isMyBusinessIndex >= 0 
          ? values[isMyBusinessIndex].toLowerCase() === 'yes' || values[isMyBusinessIndex].toLowerCase() === 'true'
          : false;

        const ranking: GMBRanking = {
          id: `rank-${Date.now()}-${i}`,
          keywordId: matchingKeyword.id,
          rank,
          gmbName: values[gmbNameIndex],
          trafficShare,
          isMyBusiness,
        };
        rankings.push(ranking);
      }
    }
  }

  return rankings;
};

export const downloadSampleKeywordsCSV = () => {
  const csvContent = `Keyword,Monthly Searches,Competition,CPC,State,City,Avg Job Size
plumber near me,5000,High,15.50,California,Los Angeles,350
emergency plumber,3200,High,22.00,California,Los Angeles,450
24 hour plumber,2100,Medium,18.75,California,Los Angeles,500`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_keywords.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadSampleRankingsCSV = () => {
  const csvContent = `Keyword,Rank,GMB Name,Traffic Share,My Business
plumber near me,1,ABC Plumbing,15,No
plumber near me,2,XYZ Plumbing,12,Yes
plumber near me,3,Quality Plumbing,8,No
emergency plumber,1,Fast Plumbing,15,No
emergency plumber,2,ABC Plumbing,12,No
emergency plumber,3,XYZ Plumbing,8,Yes`;

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_rankings.csv';
  link.click();
  URL.revokeObjectURL(url);
};
