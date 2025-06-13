
import React from 'react';

interface DetailedInfoProps {
  data: {
    title: string;
    title_english?: string;
    title_japanese?: string;
    authors?: { name: string }[];
    studios?: { name: string }[];
    genres: { name: string }[];
    themes?: { name: string }[];
    demographics?: { name: string }[];
    synopsis: string;
    status: string;
    type: string;
    chapters?: number;
    volumes?: number;
    episodes?: number;
    source?: string;
    aired?: {
      from: string;
      to?: string;
    };
    published?: {
      from: string;
      to?: string;
    };
  };
  type: 'anime' | 'manga';
}

const DetailedInfo: React.FC<DetailedInfoProps> = ({ data, type }) => {
  const getAuthorInfo = () => {
    if (type === 'manga' && data.authors) {
      return data.authors.map(author => author.name).join(', ');
    }
    if (type === 'anime' && data.studios) {
      return data.studios.map(studio => studio.name).join(', ');
    }
    return 'Not available';
  };

  const getAllGenres = () => {
    const allGenres = [...data.genres];
    if (data.themes) allGenres.push(...data.themes);
    if (data.demographics) allGenres.push(...data.demographics);
    return allGenres.map(genre => genre.name).join(', ');
  };

  const getEnhancedPlot = () => {
    const synopsis = data.synopsis || '';
    
    // Check if synopsis is very short or incomplete
    if (synopsis.length < 100 || synopsis.includes('season of') || synopsis.includes('sequel to')) {
      let enhancedPlot = synopsis;
      
      // Add context for sequels/seasons
      if (synopsis.includes('season of') || synopsis.includes('sequel to')) {
        enhancedPlot += '\n\nThis is a continuation of the series, building upon the established story and characters from previous installments. ';
        
        if (type === 'anime') {
          enhancedPlot += 'The anime continues to explore the themes and narrative elements that made the original series popular among fans.';
        } else {
          enhancedPlot += 'The manga further develops the storyline and character arcs from the previous volumes.';
        }
      }
      
      // Add generic context for very short descriptions
      if (synopsis.length < 50) {
        enhancedPlot += '\n\nThis ' + type + ' offers an engaging story with compelling characters and themes that resonate with its audience. ';
        enhancedPlot += 'The narrative explores various aspects of its genre, providing entertainment and depth for viewers/readers.';
      }
      
      return enhancedPlot || 'No detailed synopsis available, but this title is recognized within the anime/manga community for its unique storytelling and character development.';
    }
    
    return synopsis;
  };

  const getStatusInfo = () => {
    if (type === 'manga') {
      return {
        mangaStatus: data.status,
        animeAdaptation: 'Check external sources'
      };
    }
    return {
      animeStatus: data.status,
      mangaSource: data.source || 'Original'
    };
  };

  const getTitleMeaning = () => {
    const titles = [];
    if (data.title_english && data.title_english !== data.title) {
      titles.push(`English: ${data.title_english}`);
    }
    if (data.title_japanese && data.title_japanese !== data.title) {
      titles.push(`Japanese: ${data.title_japanese}`);
    }
    return titles.length > 0 ? titles.join(' | ') : 'Original title';
  };

  const getThemes = () => {
    if (data.themes && data.themes.length > 0) {
      return data.themes.map(theme => theme.name).join(', ');
    }
    return 'Based on genre and story elements';
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Author/Studio */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-primary">
            {type === 'manga' ? 'Author(s)' : 'Studio(s)'}
          </h4>
          <p className="text-foreground/90 leading-relaxed">
            {getAuthorInfo()}
          </p>
        </div>

        {/* Genre */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-primary">Genres</h4>
          <p className="text-foreground/90 leading-relaxed">
            {getAllGenres()}
          </p>
        </div>

        {/* Enhanced Plot */}
        <div className="space-y-3 md:col-span-2">
          <h4 className="text-lg font-semibold text-primary">Plot</h4>
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
            {getEnhancedPlot()}
          </p>
        </div>

        {/* Themes */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-primary">Themes</h4>
          <p className="text-foreground/90 leading-relaxed">
            {getThemes()}
          </p>
        </div>

        {/* Inspiration/Source */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-primary">Inspiration</h4>
          <p className="text-foreground/90 leading-relaxed">
            {type === 'anime' 
              ? (data.source || 'Original work')
              : 'Original manga creation'
            }
          </p>
        </div>

        {/* Status Information */}
        {type === 'manga' ? (
          <>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-primary">Manga Status</h4>
              <p className="text-foreground/90 leading-relaxed">
                {statusInfo.mangaStatus}
                {data.chapters && ` - ${data.chapters} chapters`}
                {data.volumes && ` in ${data.volumes} volumes`}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-primary">Anime Adaptation</h4>
              <p className="text-foreground/90 leading-relaxed">
                {statusInfo.animeAdaptation}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-primary">Anime Status</h4>
              <p className="text-foreground/90 leading-relaxed">
                {statusInfo.animeStatus}
                {data.episodes && ` - ${data.episodes} episodes`}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-primary">Source Material</h4>
              <p className="text-foreground/90 leading-relaxed">
                {statusInfo.mangaSource}
              </p>
            </div>
          </>
        )}

        {/* Title Meaning */}
        <div className="space-y-3 md:col-span-2">
          <h4 className="text-lg font-semibold text-primary">Title Variants</h4>
          <p className="text-foreground/90 leading-relaxed">
            {getTitleMeaning()}
          </p>
        </div>
      </div>

      {/* Thank You Section */}
      <div className="text-center py-12 border-t border-border">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold gradient-text">
            Thank You For Using Kagurabachi
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We hope you enjoyed exploring the world of anime and manga with us. 
            Discover more amazing stories and characters in our extensive collection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailedInfo;
