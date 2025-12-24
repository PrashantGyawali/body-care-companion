import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { bodyParts } from '@/utils/body-parts';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
}

interface ChatBotProps {
  selectedBodyParts: string[] | null;
  onAssessmentComplete: (assessment: AssessmentData) => void;
}

export interface AssessmentData {
  bodyPart: string;
  painSeverity: number;
  duration: string;
  painType: string;
  age: string;
  activityLevel: string;
}

const questions = [
  {
    id: 'severity',
    question: "On a scale of 1-10, how would you rate your pain?",
    options: ['1-3 (Mild)', '4-6 (Moderate)', '7-10 (Severe)'],
    field: 'painSeverity'
  },
  {
    id: 'duration',
    question: "How long have you been experiencing this pain?",
    options: ['Less than a week', '1-4 weeks', '1-3 months', 'More than 3 months'],
    field: 'duration'
  },
  {
    id: 'type',
    question: "What type of pain are you experiencing?",
    options: ['Sharp/Stabbing', 'Dull/Aching', 'Burning', 'Throbbing', 'Stiffness'],
    field: 'painType'
  },
  {
    id: 'age',
    question: "What is your age range?",
    options: ['Under 30', '30-45', '45-60', 'Over 60'],
    field: 'age'
  },
  {
    id: 'activity',
    question: "What is your current activity level?",
    options: ['Sedentary', 'Light activity', 'Moderate activity', 'Very active'],
    field: 'activityLevel'
  }
];

export const ChatBot: React.FC<ChatBotProps> = ({ selectedBodyParts, onAssessmentComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessment, setAssessment] = useState<Partial<AssessmentData>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedBodyParts.length > 0) {
      const partName = selectedBodyParts
        .map(part =>
          bodyParts.filter(bodypart=>bodypart.id==part)[0].title
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
        )
        .reduce((acc, curr, idx, arr) => {
          if (idx === 0) return curr;
          if (idx === arr.length - 1) return acc + " and " + curr;
          return acc + ", " + curr;
        }, "");
      setAssessment({ bodyPart: partName });

      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: '1',
            type: 'bot',
            content: `I see you're experiencing discomfort around your ${partName}. Let me ask you a few questions to better understand your condition and recommend the right exercises.`
          }
        ]);
        setIsTyping(false);

        // First question
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: '2',
              type: 'bot',
              content: questions[0].question,
              options: questions[0].options
            }]);
            setIsTyping(false);
          }, 800);
        }, 500);
      }, 1000);
    }
  }, [selectedBodyParts]);

  const handleOptionSelect = (option: string) => {
    const currentQuestion = questions[currentQuestionIndex];

    // Add user response
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: option
    }]);

    // Update assessment
    const newAssessment = {
      ...assessment,
      [currentQuestion.field]: option
    };
    setAssessment(newAssessment);

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: questions[nextIndex].question,
          options: questions[nextIndex].options
        }]);
        setIsTyping(false);
      }, 800);
    } else {
      // Assessment complete
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-complete`,
          type: 'bot',
          content: "Thank you for providing this information! Based on your responses, I've prepared personalized exercise recommendations for you. Click below to view your treatment plan."
        }]);
        setIsTyping(false);
        onAssessmentComplete(newAssessment as AssessmentData);
      }, 1000);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue
    }]);
    setInputValue('');

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: "Please select one of the options above to continue with your assessment."
      }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[500px] bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      {/* Header */}
      <div className="gradient-primary px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-primary-foreground">PhysioBot</h3>
            <p className="text-sm text-primary-foreground/80">Your therapy assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 animate-slide-up',
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              message.type === 'user'
                ? 'bg-accent text-accent-foreground'
                : 'bg-primary/10 text-primary'
            )}>
              {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              'max-w-[80%] space-y-2',
              message.type === 'user' ? 'items-end' : 'items-start'
            )}>
              <div className={cn(
                'px-4 py-3 rounded-2xl',
                message.type === 'user'
                  ? 'bg-accent text-accent-foreground rounded-br-md'
                  : 'bg-secondary text-secondary-foreground rounded-bl-md'
              )}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {message.options && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 border border-primary/20"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 bg-secondary rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-secondary border-0"
          />
          <Button onClick={handleSendMessage} size="icon" variant="hero">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
