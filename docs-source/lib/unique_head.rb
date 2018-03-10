# Unique header generation
require 'middleman-core/renderers/redcarpet'
class UniqueHeadCounter < Middleman::Renderers::MiddlemanRedcarpetHTML
  def initialize
    super
    @head_count = {}
  end
  def header(text, header_level)
    friendly_text = text.to_s.gsub("&#160;", "").gsub(%r{\([^)]*\)}, "").gsub(%r{<[^>]*>}, "")
    friendly_text = friendly_text.parameterize
    #.to_s.gsub("160-", "").gsub(%r{-?code-?}, "")
    text = "<small>#{text}</small>" if text.include? "&#160;"
    @head_count[friendly_text] ||= 0
    @head_count[friendly_text] += 1
    if @head_count[friendly_text] > 1
      friendly_text += "-#{@head_count[friendly_text]}"
    end
    return "<h#{header_level} id='#{friendly_text}'>#{text}</h#{header_level}>"
  end
end
