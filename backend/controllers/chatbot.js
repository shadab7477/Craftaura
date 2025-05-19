import natural from 'natural';
import stringSimilarity from 'string-similarity';
import { getProductCatalog } from '../services/carpetService.js';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Enhanced greeting system with time awareness
const GREETINGS = {
  morning: [
    "Good morning! Welcome to Carpet Artisan. Did you know our Zurich atelier just received new Himalayan wool shipments? How may we assist you today?",
    "A beautiful morning for carpets! We have 12 new designs added this week. What brings you here?"
  ],
  afternoon: [
    "Good afternoon! Ready to explore our handcrafted collections? Our artisans just completed 3 custom pieces this week.",
    "Afternoon! We're currently offering 15% off on Alpine wool carpets. How can we help with your carpet needs?"
  ],
  evening: [
    "Good evening! Our virtual assistant is at your service. Did you know we offer evening consultations until 8 PM?",
    "Evening! Perfect time to discuss that special carpet for your home. We have 24 silk designs available."
  ],
  general: [
    "Hello! Welcome to carpetartisan.ch We've served over 1,200 clients this year. How can we help?",
    "Greetings! Our collection features 300+ carpets from 12 regions. What questions can we answer today?"
  ]
};

// Dynamic response generator
const humanizeResponse = (response) => {
  const pauses = [", you see", ", as you know", ", naturally", ""];
  const fillers = ["Well,", "So,", "You see,", "I should mention,", "Now,", ""];
  const endings = [".", "!", "..."];
  
  return `${fillers[Math.floor(Math.random() * fillers.length)]} ${response}${
    pauses[Math.floor(Math.random() * pauses.length)]
  }${endings[Math.floor(Math.random() * endings.length)]}`;
};

// Enhanced fuzzy matching
const enhancedMatch = (input, targets) => {
  const inputStemmed = stemmer.stem(input);
  return targets.some(target => {
    const targetStemmed = stemmer.stem(target);
    const similarity = stringSimilarity.compareTwoStrings(input, target);
    
    return (
      similarity > 0.7 ||
      inputStemmed === targetStemmed ||
      input.includes(target) ||
      target.includes(input)
    );
  });
};

// Context manager with memory
const getContext = (conversationHistory) => {
  if (conversationHistory.length === 0) return null;
  
  const lastThree = conversationHistory.slice(-3);
  const lastUserMessage = lastThree[lastThree.length - 1].message.toLowerCase();

  if (lastUserMessage.includes('consult')) return 'consultation';
  if (lastUserMessage.includes('material')) return 'material';
  if (lastUserMessage.includes('showroom')) return 'showroom';
  if (lastUserMessage.includes('price')) return 'pricing';
  if (lastUserMessage.includes('clean')) return 'care';
  if (lastUserMessage.includes('custom')) return 'custom';
  
  return null;
};

// Product knowledge base
const PRODUCT_KNOWLEDGE = {
  materials: {
    wool: {
      description: "Swiss Alpine Wool (CHF 320/m²) - Grown in high-altitude pastures, our wool has 30% more lanolin than standard wool, making it naturally stain-resistant. Ideal for high-traffic areas.",
      stats: "Durability: 9/10 • Softness: 7/10 • Maintenance: Easy"
    },
    silk: {
      description: "Grade A Silk (CHF 890/m²) - Each thread is hand-spun for maximum luster. A single square meter contains 1.2 million knots. Perfect for decorative pieces.",
      stats: "Durability: 6/10 • Softness: 10/10 • Maintenance: Professional"
    }
  },
  styles: {
    traditional: "Our traditional collection features 78 designs from 5 Swiss regions, with patterns dating back to 18th century. Average production time: 3 months.",
    modern: "Contemporary designs by 12 award-winning artists. 45 pieces in stock, sizes from 1x1m to 4x6m. Lead time for custom: 6-8 weeks."
  }
};

export const generateResponse = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const lowerMsg = message.toLowerCase().trim();
    const tokens = tokenizer.tokenize(lowerMsg);
    const currentContext = getContext(conversationHistory);
    const catalog = await getProductCatalog();

    // Time-based greeting
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return GREETINGS.morning;
      if (hour < 18) return GREETINGS.afternoon;
      return GREETINGS.evening;
    };

    // Greeting detection
    if (enhancedMatch(lowerMsg, ['hello', 'hi', 'greetings', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
      const greetings = conversationHistory.length > 2 ? GREETINGS.general : getGreeting();
      return res.json({
        reply: humanizeResponse(greetings[Math.floor(Math.random() * greetings.length)]),
        suggestions: ['Show collections', 'About artisans', 'Visit showroom', 'Custom orders'],
        context: 'greeting'
      });
    }

    // Handcraft questions
    const artisanWords = ['handmade', 'handcrafted', 'handwoven', 'artisan', 'craftsmanship', 'weaver', 'maker'];
    if (tokens.some(token => enhancedMatch(token, artisanWords))) {
      return res.json({
        reply: humanizeResponse(
          `Our 14 master artisans average 27 years experience each. Recent achievements:\n\n` +
          `• 2023 European Craftsmanship Award\n` +
          `• 42,800 knots per square meter (record)\n` +
          `• 98.7% client satisfaction rate\n\n` +
          `Each piece requires ${Math.floor(80 + Math.random() * 320)} working hours. ` +
          `Would you like to see our workshop video or meet the team?`
        ),
        suggestions: ['Watch crafting process', 'Meet our weavers', 'See certificates', 'Workshop tours'],
        context: 'craftsmanship'
      });
    }

    // Local production
    if (enhancedMatch(lowerMsg, ['made locally', 'local production', 'swiss made', 'origin', 'where made'])) {
      return res.json({
        reply: humanizeResponse(
          `Production details:\n\n` +
          `• Location: Zurich atelier (since 1987)\n` +
          `• Materials: ${catalog.materials.localSourced}% locally sourced\n` +
          `• Team: 14 full-time artisans\n` +
          `• Annual production: ${catalog.stats.annualProduction} m²\n\n` +
          `Our vertically integrated process ensures quality at every step. ` +
          `Would you like our sustainability report?`
        ),
        suggestions: ['Sustainability practices', 'Material origins', 'Production timeline', 'Quality control'],
        context: 'production'
      });
    }

    // Customization
    const customWords = ['custom', 'bespoke', 'personalized', 'unique', 'made to order', 'special order'];
    if (tokens.some(token => enhancedMatch(token, customWords)) || currentContext === 'custom') {
      return res.json({
        reply: humanizeResponse(
        `Custom options:\n\n` +
    `1. **Design**: ${catalog.custom.designOptions} patterns available\n` +
    `2. **Size**: Up to ${catalog.custom.maxSize} m²\n` +
    `3. **Materials**: ${catalog.custom.materialOptions.join(', ')}\n` +
    `4. **Timeline**: ${catalog.custom.productionTime} weeks average\n\n` +
    `Recent projects:\n` +
    `• ${catalog.custom.recentProjects[0]}\n` +
    `• ${catalog.custom.recentProjects[1]}\n\n` +
    `Would you like to start with room dimensions or inspiration images?`
        ),
        suggestions: ['Upload room photos', 'Start with dimensions', 'See custom gallery', 'Pricing calculator'],
        context: 'custom'
      });
    }

    // Materials
    const materialWords = ['wool', 'alpaca', 'silk', 'material', 'fiber', 'cotton', 'fabric'];
    if (tokens.some(token => enhancedMatch(token, materialWords)) || currentContext === 'material') {
      const material = enhancedMatch(lowerMsg, ['silk']) ? 'silk' : 
                      enhancedMatch(lowerMsg, ['cotton']) ? 'cotton' : 'wool';
      
      return res.json({
        reply: humanizeResponse(
          `${PRODUCT_KNOWLEDGE.materials[material].description}\n\n` +
          `${PRODUCT_KNOWLEDGE.materials[material].stats}\n\n` +
          `Current availability: ${catalog.materials[material].stock} m² in stock\n` +
          `Lead time for custom: ${catalog.materials[material].leadTime} weeks`
        ),
        suggestions: ['Compare materials', 'Request samples', 'Care instructions', 'See projects'],
        context: 'materials'
      });
    }

    // Pricing
    if (enhancedMatch(lowerMsg, ['price', 'cost', 'budget', 'how much', 'afford'])) {
      return res.json({
        reply: humanizeResponse(
          `Our pricing structure:\n\n` +
          `• Ready-made: CHF ${catalog.pricing.readyMade.min}-${catalog.pricing.readyMade.max}/m²\n` +
          `• Custom: CHF ${catalog.pricing.custom.min}-${catalog.pricing.custom.max}/m²\n` +
          `• Current promotions:\n` +
          `  - ${catalog.pricing.promotions[0]}\n` +
          `  - ${catalog.pricing.promotions[1]}\n\n` +
          `For exact quotes, we'll need:\n` +
          `1. Size 2. Material 3. Design complexity\n\n` +
          `Would you like our price estimator tool?`
        ),
        suggestions: ['Use estimator', 'See payment plans', 'Compare options', 'Budget consultation'],
        context: 'pricing'
      });
    }

    // Showroom
    if (enhancedMatch(lowerMsg, ['showroom', 'zurich', 'visit', 'atelier', 'store', 'see in person'])) {
      return res.json({
        reply: humanizeResponse(
          `Zurich Flagship Atelier:\n\n` +
          `• Address: Bahnhofstrasse 12 (3rd floor)\n` +
          `• Current exhibits:\n` +
          `  - ${catalog.showroom.exhibits[0]}\n` +
          `  - ${catalog.showroom.exhibits[1]}\n\n` +
          `Special this week:\n` +
          `• ${catalog.showroom.specials.join('\n• ')}\n\n` +
          `Private viewings include:\n` +
          `- Material samples\n- Design consultation\n- 15% discount\n\n` +
          `Shall I check availability for your preferred date?`
        ),
        suggestions: ['Book appointment', 'Virtual tour', 'Parking info', 'Current inventory'],
        context: 'showroom'
      });
    }

    // Fallback with context awareness
    switch (currentContext) {
      case 'consultation':
        return res.json({
          reply: humanizeResponse(
            `For your consultation, we currently have:\n\n` +
            `• ${catalog.consultation.availability.join('\n• ')}\n\n` +
            `Our consultants average ${catalog.consultation.experience} years experience. ` +
            `Would you prefer in-person or virtual?`
          ),
          suggestions: ['In-person', 'Video call', 'Send dimensions first', 'See consultant profiles'],
          context: 'consultation'
        });
      
      case 'material':
        return res.json({
          reply: humanizeResponse(
            `Material comparison:\n\n` +
            `1. Wool: ${PRODUCT_KNOWLEDGE.materials.wool.stats}\n` +
            `2. Silk: ${PRODUCT_KNOWLEDGE.materials.silk.stats}\n\n` +
            `Sample kits ship in ${catalog.materials.sampleTime} business days. ` +
            `Would you like to request samples or see care instructions?`
          ),
          suggestions: ['Request samples', 'Compare durability', 'Cleaning guide', 'Back to main'],
          context: 'material'
        });
    }

    // Final fallback
    return res.json({
      reply: humanizeResponse(
        `To better assist you, could you tell me about:\n\n` +
        `• Room size (we have ${catalog.stats.readyMadeSizes} standard sizes)\n` +
        `• Preferred style (${Object.keys(catalog.styles).join('/')})\n` +
        `• Budget range (we offer payment plans)\n\n` +
        `Or browse our ${catalog.stats.totalDesigns} designs?`
      ),
      suggestions: ['Modern designs', 'Traditional patterns', 'Budget options', 'Size guide'],
      needsHuman: true
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      reply: humanizeResponse(
        "Apologies, we're experiencing technical difficulties. " +
        "Our team has been notified. In the meantime, you can:\n\n" +
        "1. Call +41 44 123 45 67\n" +
        "2. Email help@carpetmaster.ch\n" +
        "3. Visit our FAQ page"
      ),
      needsHuman: true
    });
  }
};