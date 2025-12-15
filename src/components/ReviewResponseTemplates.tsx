import React, { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Star, Copy, Search, Filter, MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ReviewTemplate {
  id: string;
  category: 'positive' | 'neutral' | 'negative';
  rating: number;
  situation: string;
  template: string;
  tags: string[];
}

const reviewTemplates: ReviewTemplate[] = [
  // Positive Reviews (5 stars)
  {
    id: 'pos-1',
    category: 'positive',
    rating: 5,
    situation: 'General 5-star review',
    template: 'Thank you so much for the wonderful 5-star review, [Customer Name]! We\'re thrilled to hear that you had a great experience with our service. Your feedback means the world to us and motivates our team to continue delivering exceptional results. We look forward to serving you again in the future!',
    tags: ['general', 'appreciation']
  },
  {
    id: 'pos-2',
    category: 'positive',
    rating: 5,
    situation: 'Praised specific team member',
    template: 'Hi [Customer Name], thank you for the fantastic review! We\'re so glad [Team Member] was able to provide you with excellent service. We\'ll make sure to share your kind words with them. We appreciate your business and hope to work with you again soon!',
    tags: ['team member', 'specific praise']
  },
  {
    id: 'pos-3',
    category: 'positive',
    rating: 5,
    situation: 'Fast/Emergency service',
    template: 'Thank you for the 5-star review, [Customer Name]! We understand how stressful emergencies can be, and we\'re happy we could respond quickly and resolve the issue for you. Our team is available 24/7 for your convenience. Don\'t hesitate to reach out if you need us again!',
    tags: ['emergency', 'speed', 'availability']
  },
  {
    id: 'pos-4',
    category: 'positive',
    rating: 5,
    situation: 'Competitive pricing mentioned',
    template: 'We appreciate your kind words, [Customer Name]! We strive to provide the best value without compromising on quality. It\'s wonderful to hear that our transparent pricing and professional service met your expectations. Thank you for choosing us!',
    tags: ['pricing', 'value']
  },

  // Neutral Reviews (3-4 stars)
  {
    id: 'neu-1',
    category: 'neutral',
    rating: 4,
    situation: 'General 4-star review',
    template: 'Thank you for your review, [Customer Name]! We\'re glad we could help with your [service type]. We\'re always looking to improve, so if there\'s anything we could have done better, we\'d love to hear your feedback. We appreciate your business!',
    tags: ['general', 'improvement']
  },
  {
    id: 'neu-2',
    category: 'neutral',
    rating: 3,
    situation: 'Minor complaint but satisfied overall',
    template: 'Hi [Customer Name], thank you for taking the time to leave feedback. We\'re sorry to hear about [issue mentioned], and we appreciate you bringing this to our attention. We\'re always working to improve our service. We\'d love the opportunity to make this right - please reach out to us at [phone] so we can discuss further.',
    tags: ['issue resolution', 'follow-up']
  },
  {
    id: 'neu-3',
    category: 'neutral',
    rating: 4,
    situation: 'Slight delay mentioned',
    template: 'Thank you for your review, [Customer Name]. We apologize for the slight delay in [specific area]. We understand your time is valuable, and we\'re implementing changes to improve our scheduling. We\'re glad we could ultimately meet your needs, and we appreciate your patience and understanding!',
    tags: ['delay', 'scheduling', 'improvement']
  },

  // Negative Reviews (1-2 stars)
  {
    id: 'neg-1',
    category: 'negative',
    rating: 2,
    situation: 'Price concern',
    template: 'Hi [Customer Name], thank you for your feedback. We understand your concerns about the pricing. We always provide upfront estimates before beginning work, and our prices reflect the quality of materials and expertise we provide. We\'d like to discuss this further with you - please contact us at [phone] so we can address your concerns.',
    tags: ['pricing', 'resolution', 'explanation']
  },
  {
    id: 'neg-2',
    category: 'negative',
    rating: 1,
    situation: 'Unhappy with service quality',
    template: 'Dear [Customer Name], we\'re very sorry to hear about your experience. This is not the level of service we strive for. We take your feedback seriously and would like to make this right. Please contact our manager directly at [phone] so we can investigate and resolve this issue immediately. We appreciate the opportunity to improve.',
    tags: ['quality', 'escalation', 'apology']
  },
  {
    id: 'neg-3',
    category: 'negative',
    rating: 2,
    situation: 'Communication issues',
    template: 'Hi [Customer Name], we sincerely apologize for the communication breakdown. Clear communication is a top priority for us, and we clearly fell short in your case. We\'ve addressed this with our team and implemented new procedures to prevent this from happening again. We\'d appreciate the chance to regain your trust. Please reach out to us at [phone].',
    tags: ['communication', 'process improvement']
  },
  {
    id: 'neg-4',
    category: 'negative',
    rating: 1,
    situation: 'No-show or late arrival',
    template: 'Dear [Customer Name], we\'re extremely sorry for [missing appointment/arriving late]. This is absolutely unacceptable, and we take full responsibility. We\'re investigating what happened internally to ensure this never occurs again. We\'d like to offer you [compensation/discount] on your next service. Please call us at [phone] to discuss how we can make this right.',
    tags: ['scheduling', 'compensation', 'serious issue']
  },

  // Additional Scenarios
  {
    id: 'pos-5',
    category: 'positive',
    rating: 5,
    situation: 'Referred by friend/family',
    template: 'Thank you so much for the glowing review, [Customer Name]! We\'re honored that you were referred to us by [referrer name] and that we lived up to their recommendation. Word-of-mouth referrals are the highest compliment we can receive. If you know anyone else who needs our services, we\'d love to help them too!',
    tags: ['referral', 'word of mouth']
  },
  {
    id: 'pos-6',
    category: 'positive',
    rating: 5,
    situation: 'Repeat customer',
    template: 'Hi [Customer Name], thank you for the wonderful review and for being a loyal customer! We truly appreciate your continued trust in our services. It\'s customers like you who make our work so rewarding. We look forward to serving you again in the future!',
    tags: ['loyalty', 'repeat customer']
  },
  {
    id: 'neu-4',
    category: 'neutral',
    rating: 3,
    situation: 'Weather/external factor delay',
    template: 'Thank you for your feedback, [Customer Name]. We apologize for the delay caused by [weather/external factor]. While these situations are beyond our control, we understand the inconvenience it caused. We appreciate your understanding and are glad we could complete the work to your satisfaction!',
    tags: ['external factors', 'understanding']
  },
  {
    id: 'neg-5',
    category: 'negative',
    rating: 2,
    situation: 'Work needs to be redone',
    template: 'Dear [Customer Name], we\'re very sorry to hear that the work didn\'t meet your expectations. Quality is our #1 priority, and we\'d like to come back and make this right at no additional charge. Please contact us at [phone] so we can schedule a time to correct this. We stand behind our work and want you to be completely satisfied.',
    tags: ['quality guarantee', 'redo work', 'warranty']
  }
];

export default function ReviewResponseTemplates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = reviewTemplates.filter(template => {
    const matchesSearch = template.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.template.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (template: string, id: string) => {
    navigator.clipboard.writeText(template);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'positive': return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
      case 'neutral': return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
      case 'negative': return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
      default: return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className="size-4"
        fill={i < rating ? '#FBBF24' : 'none'}
        stroke={i < rating ? '#FBBF24' : '#CBD5E1'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search templates by situation, keywords, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-slate-500" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="positive">Positive (4-5★)</SelectItem>
                <SelectItem value="neutral">Neutral (3-4★)</SelectItem>
                <SelectItem value="negative">Negative (1-2★)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map(template => {
          const colors = getCategoryColor(template.category);
          
          return (
            <Card key={template.id} className="p-5 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderColor: colors.border,
                        border: '1px solid'
                      }}
                    >
                      {template.category}
                    </Badge>
                    <div className="flex items-center gap-0.5">
                      {getRatingStars(template.rating)}
                    </div>
                  </div>
                  <h3 className="text-sm text-slate-900" style={{ fontWeight: 600 }}>
                    {template.situation}
                  </h3>
                </div>
              </div>

              {/* Template Content */}
              <div className="mb-4">
                <Textarea
                  value={template.template}
                  readOnly
                  className="min-h-[120px] text-sm bg-slate-50 resize-none"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Button */}
              <Button
                size="sm"
                className="w-full"
                variant={copiedId === template.id ? 'default' : 'outline'}
                onClick={() => copyToClipboard(template.template, template.id)}
                style={copiedId === template.id ? { backgroundColor: '#00C47E' } : {}}
              >
                <Copy className="size-4 mr-2" />
                {copiedId === template.id ? 'Copied!' : 'Copy Template'}
              </Button>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <MessageSquare className="size-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No templates found</p>
            <p className="text-sm text-slate-500">Try adjusting your search or filter</p>
          </div>
        </Card>
      )}

      {/* Best Practices */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <h3 className="text-slate-900 mb-4">Review Response Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm text-slate-900 mb-3" style={{ fontWeight: 600 }}>✅ Do's</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-sm text-slate-700">Respond within 24-48 hours</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-sm text-slate-700">Personalize each response with customer's name</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-sm text-slate-700">Thank every reviewer, even negative ones</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-sm text-slate-700">Take serious issues offline (provide phone/email)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <p className="text-sm text-slate-700">Be professional and empathetic</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm text-slate-900 mb-3" style={{ fontWeight: 600 }}>❌ Don'ts</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                <p className="text-sm text-slate-700">Don't argue or get defensive</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                <p className="text-sm text-slate-700">Don't use the same response for every review</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                <p className="text-sm text-slate-700">Don't ignore negative reviews</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                <p className="text-sm text-slate-700">Don't share personal/private information publicly</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                <p className="text-sm text-slate-700">Don't ask customers to change their review</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg">
          <p className="text-sm text-slate-700">
            <strong>💡 Pro Tip:</strong> Responding to reviews (especially negative ones) can improve your GMB ranking. 
            Google values active engagement with customers. Aim to respond to 100% of your reviews within 48 hours.
          </p>
        </div>
      </Card>
    </div>
  );
}
